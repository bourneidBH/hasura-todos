import React from "react";
import { gql, useMutation } from "@apollo/client"
import { GET_MY_TODOS } from "./TodoPrivateList";

const TodoItem = ({ index, todo, client }) => {
  
  const TOGGLE_TODO = gql`
    mutation toggleTodo ($id: Int!, $isCompleted: Boolean!) {
      update_todos(where: {id: {_eq: $id}}, _set: {is_completed: $isCompleted}) {
        affected_rows
      }
    }
  `

  const REMOVE_TODO = gql`
    mutation removeTodo ($id: Int!) {
      delete_todos(where: {id: {_eq: $id}}) {
        affected_rows
      }
    }
  `

  const [toggleTodoMutation] = useMutation(TOGGLE_TODO, {
    refetchQueries: [
      { query: GET_MY_TODOS },
      "getMyTodos"
    ]
  })

  const [removeTodoMutation] = useMutation(REMOVE_TODO, {
    refetchQueries: [
      { query: GET_MY_TODOS },
      "getMyTodos"
    ]
  })

  const toggleTodo = () => {
    toggleTodoMutation({
      variables: {id: todo.id, isCompleted: !todo.is_completed},
      // version below from edited from tutorial. Changed optimisticResponse to object match mutation shape instead of boolean true.
      // Not using because refetchQueries does the same thing simpler

      // optimisticResponse: {
      //   update_todos: {
      //     affected_rows: 1
      //   },
      // },
      // update: (cache) => {
      //   console.log(cache)
      //   const existingTodos = cache.readQuery({ query: GET_MY_TODOS});
      //   const newTodos = existingTodos?.todos?.map(t => {
      //     if (t.id === todo.id) {
      //       return {...t, is_completed: !todo.is_completed}
      //     } else {
      //       return t
      //     }
      //   })
      //   cache.writeQuery({
      //     query: GET_MY_TODOS,
      //     data: {todos: newTodos}
      //   });  
      // }
    });
  };

  const removeTodo = (e) => {
    e.preventDefault();
    e.stopPropagation();
    removeTodoMutation({
      variables: {id: todo.id},
    })
  }

  return (
    <li>
      <div className="view">
        <div className="round">
          <input
            checked={todo.is_completed}
            type="checkbox"
            id={todo.id}
            onChange={toggleTodo}
          />
          <label htmlFor={todo.id} />
        </div>
      </div>

      <div className={"labelContent" + (todo.is_completed ? " completed" : "")}>
        <div>{todo.title}</div>
      </div>

      <button className="closeBtn" onClick={removeTodo}>
        x
      </button>
    </li>
  );
};

export default TodoItem;
