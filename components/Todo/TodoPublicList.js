import React, { useState, useEffect, Fragment } from "react";
import { gql, useSubscription, useApolloClient } from "@apollo/client";

import TaskItem from "./TaskItem";

const NOTIFY_NEW_PUBLIC_TODOS = gql`
  subscription notifyNewPublicTodos {
    todos (
      where: {
        is_public: { _eq: true }
      },
      limit: 1,
      order_by: { created_at: desc }
    ) {
      id
      created_at
    }
  }
`

const GET_OLD_PUBLIC_TODOS = gql`
  query getOldPublicTodos ($oldestTodoId: Int!) {
    todos (
      where: {
        is_public: { _eq: true },
        id: { _lt: $oldestTodoId }
      },
      limit: 7,
      order_by: { created_at: desc }
    ) {
      id
      title
      created_at
      user {
        name
      }
    }
  }
`

const GET_NEW_PUBLIC_TODOS = gql`
  query getNewPublicTodos ($latestVisibleId: Int!) {
    todos (
      where: {
        is_public: { _eq: true },
        id: { _gt: $latestVisibleId }
      },
      order_by: { created_at: desc }
    ) {
      id
      title
      created_at
      user {
        name
      }
    }
  }
`

const TodoPublicList = ({ latestTodo }) => {
  const client = useApolloClient()
  const [state, setState] = useState({
    olderTodosAvailable: latestTodo ? true : false,
    newTodosCount: 0,
    todos: [],
    error: false
  })

  let numTodos = state.todos.length;
  let oldestTodoId = numTodos
    ? state.todos[numTodos - 1].id
    : latestTodo
      ? latestTodo.id + 1
      : 0;

  let newestTodoId = numTodos
    ? state.todos[0].id
    : latestTodo
      ? latestTodo.id
      : 0;

  useEffect(() => {
    loadOlder()
  }, [])

  useEffect(() => {
    if (latestTodo && latestTodo.id > newestTodoId) {
      setState({
        ...state,
        newTodosCount: state.newTodosCount + 1
      })
      newestTodoId = latestTodo.id
    }
  }, [latestTodo])

  const loadNew = async () => {
    const { error, data } = await client.query({
      query: GET_NEW_PUBLIC_TODOS,
      variables: { latestVisibleId: state.todos.length ? state.todos[0].id : null }
    })

    if (data) {
      setState({
        ...state,
        todos: [
          ...data.todos,
          ...state.todos,
        ],
        newTodosCount: 0
      })
      newestTodoId = data.todos[0].id
    }

    if (error) {
      console.log(error)
      setState({
        ...state,
        error: true
      })
    }
  };

  const loadOlder = async () => {
    const { error, data } = await client.query({
      query: GET_OLD_PUBLIC_TODOS,
      variables: { oldestTodoId: oldestTodoId }
    })
    if (data?.todos?.length) {
      setState({
        ...state,
        todos: [
          ...state.todos,
          ...data.todos
        ]
      })
      oldestTodoId = data.todos[data.todos.length - 1].id
    } else {
      setState({
        ...state,
        olderTodosAvailable: false
      })
    }

    if (error) {
      console.log(error)
      setState({
        ...state,
        error: true
      })
    }
  };

  let todos = state.todos;
  
  const todoList = (
    <ul>
      {todos.map((todo, index) => {
        return <TaskItem key={index} index={index} todo={todo} />;
      })}
    </ul>
  );

  let newTodosNotification = "";
  if (state.newTodosCount) {
    newTodosNotification = (
      <div className={"loadMoreSection"} onClick={loadNew}>
        New tasks have arrived! ({state.newTodosCount.toString()})
      </div>
    );
  }

  const olderTodosMsg = (
    <div className={"loadMoreSection"} onClick={loadOlder}>
      {state.olderTodosAvailable ? "Load older tasks" : "No more public tasks!"}
    </div>
  );

  return (
    <Fragment>
      <div className="todoListWrapper">
        {newTodosNotification}

        {todoList}

        {olderTodosMsg}
      </div>
    </Fragment>
  );
};

const TodoPublicListSubscription = () => {
  const { loading, error, data } = useSubscription(NOTIFY_NEW_PUBLIC_TODOS)

  if (loading) return <span>Loading...</span>
  if (error) {
    console.log(error)
    return <span>Error!</span>
  }
  return (
    <TodoPublicList latestTodo={data?.todos?.length ? data.todos[0] : null} />
  )
}

export default TodoPublicListSubscription;