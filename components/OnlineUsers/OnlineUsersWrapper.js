import { useState, useEffect } from "react";
import { gql, useMutation, useSubscription } from "@apollo/client";

import OnlineUser from "./OnlineUser";

const onlineUsersSubscription = gql`
  subscription getOnlineUsers {
    online_users(order_by: { user: { name: asc }}) {
      id
      user {
        name
      }
    }
  }
`

const OnlineUsersWrapper = () => {
  const [onlineIndicator, setOnlineIndicator] = useState(0);

  useEffect(() => {
    // run mutation to tell backend you're online every 20 seconds
    updateLastSeen();
    setOnlineIndicator(setInterval(() => updateLastSeen(), 20000));
    // clean up
    return () => clearInterval(onlineIndicator)
  }, [])

  const UPDATE_LASTSEEN_MUTATION = gql`
    mutation updateLastSeen($now: timestamptz!) {
      update_users(where: {}, _set: { last_seen: $now}) {
        affected_rows
      }
    }
  `
  const [updateLastSeenMutation] = useMutation(UPDATE_LASTSEEN_MUTATION)

  const updateLastSeen = () => {
    updateLastSeenMutation({
      variables: { now: new Date().toISOString() }
    })
  }

  const { loading, error, data } = useSubscription(onlineUsersSubscription)

  if (loading) return <span>Loading...</span>
  if (error) {
    console.log(error)
    return <span>Error loading users!</span>
  }


  const onlineUsersList = data ? data?.online_users?.map(u => (
    <OnlineUser key={u.id} user={u.user} />
  )) : [];

  return (
    <div className="onlineUsersWrapper">
      <div className="sliderHeader">Online users - {onlineUsersList.length}</div>
      {onlineUsersList}
    </div>
  );
};

export default OnlineUsersWrapper;
