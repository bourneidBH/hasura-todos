import { useState } from "react";
import { gql, useMutation } from "@apollo/client";
import { GET_MY_TODOS } from "./TodoPrivateList"

const ADD_TODO = gql`
  mutation addTodo ($todo: String!, $isPublic: Boolean!) {
    insert_todos(objects: {title: $todo, is_public: $isPublic}) {
      affected_rows
      returning {
        id
        title
        created_at
        is_completed
      }
    }
  }
`

const TodoInput = ({ isPublic = false }) => {
  let input;
  const [todoInput, setTodoInput] = useState("")
  const [addTodo] = useMutation(ADD_TODO, {
    refetchQueries: [
      { query: GET_MY_TODOS },
      "addTodo"
    ],
    onCompleted: resetInput
  })

  const resetInput = () => {
    setTodoInput("")
  }

  // From tutorial used in place of refetchQueries in TodoInput function above

  // const updateCache = (cache, {data}) => {
  //   // If Todo is for public feed do nothing
  //   if (isPublic) return null;

  //   // fetch todos from cache
  //   const existingTodos = cache.readQuery({
  //     query: GET_MY_TODOS
  //   })

  //   // Add new todo to cache
  //   const newTodo = data.insert_todos.returning[0];
  //   cache.writeQuery({
  //     query: GET_MY_TODOS,
  //     data: { todos: [newTodo, ...existingTodos.todos]}
  //   })
  // }

  return (
    <form
      className="formInput"
      onSubmit={e => {
        e.preventDefault();
        addTodo({variables: {todo: todoInput, isPublic}})
      }}
    >
      <input 
        className="input" 
        placeholder="What needs to be done?" 
        value={todoInput}
        onChange={(e) => setTodoInput(e.target.value)}
        ref={n => (input = n)} //what is this?
      />
      <i className="inputMarker fa fa-angle-right" />
    </form>
  );
};

export default TodoInput;
