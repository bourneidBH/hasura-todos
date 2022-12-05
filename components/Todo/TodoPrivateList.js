import React, { useState, useEffect, Fragment } from "react";
import { gql, useQuery, useMutation } from "@apollo/client"
import TodoItem from "./TodoItem";
import TodoFilters from "./TodoFilters";

export const GET_MY_TODOS = gql`
query getMyTodos {
  todos(where: { is_public: { _eq: false} }, order_by: { created_at: desc }) {
    id
    title
    created_at
    is_completed
  }
}
`

export const CLEAR_COMPLETED = gql`
  mutation clearCompleted {
    delete_todos(where: {is_completed: {_eq: true}, is_public: {_eq: false}}) {
      affected_rows
    }
  }
`

const TodoPrivateList = ({ todos }) => {
  const [state, setState] = useState({
    filter: "all",
    clearInProgress: false,
  });

  const filterResults = filter => {
    setState({
      ...state,
      filter: filter
    });
  };

  const [clearCompletedTodos] = useMutation(CLEAR_COMPLETED)

  const clearCompleted = () => {
    clearCompletedTodos({
      optimisticResponse: true,
      update: (cache, { data }) => {
        const existingTodos = cache.readQuery({ query: GET_MY_TODOS})
        const newTodos = existingTodos?.todos?.filter(t => !t.is_complete)
        cache.writeQuery({query: GET_MY_TODOS, data: {todos: newTodos}})
      }
    })
  };

  let filteredTodos = todos;
  if (state.filter === "active") {
    filteredTodos = todos.filter(todo => todo.is_completed !== true);
  } else if (state.filter === "completed") {
    filteredTodos = todos.filter(todo => todo.is_completed === true);
  }

  const todoList = filteredTodos.map((todo, index) => (
    <TodoItem key={todo?.id || index} index={index} todo={todo} />
  ))
  console.log(todos)

  return (
    <Fragment>
      <div className="todoListWrapper">
        <ul>{todoList}</ul>
      </div>

      <TodoFilters
        todos={filteredTodos}
        currentFilter={state.filter}
        filterResultsFn={filterResults}
        clearCompletedFn={clearCompleted}
        clearInProgress={state.clearInProgress}
      />
    </Fragment>
  );
};

const TodoPrivateListQuery = () => {
  const { loading, error, data } = useQuery(GET_MY_TODOS)
  if (loading) return <div>Loading...</div>
  if (error) {
    console.log(error)
    return <div>Error Loading Todos!</div>
  }
  return <TodoPrivateList todos={data?.todos} />
}

export default TodoPrivateListQuery;
