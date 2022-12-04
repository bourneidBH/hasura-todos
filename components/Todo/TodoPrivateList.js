import React, { useState, useEffect, Fragment } from "react";
import { gql, useQuery } from "@apollo/client"
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

const TodoPrivateList = ({ todos }) => {
  const [state, setState] = useState({
    filter: "all",
    clearInProgress: false,
    todos: todos || []
  });

  const filterResults = filter => {
    setState({
      ...state,
      filter: filter
    });
  };

  const clearCompleted = () => {};

  let filteredTodos = state.todos;
  if (state.filter === "active") {
    filteredTodos = state.todos.filter(todo => todo.is_completed !== true);
  } else if (state.filter === "completed") {
    filteredTodos = state.todos.filter(todo => todo.is_completed === true);
  }

  const todoList = filteredTodos.map((todo, index) => (
    <TodoItem key={todo?.id || index} index={index} todo={todo} />
  ))

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
