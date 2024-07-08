// import React from 'react';
// import { BrowserRouter, Route, Switch } from "react-router-dom";
// import CreateRoom from "./routes/CreateRoom";
// import Room from "./routes/Room";

// function App() {
//   return (
//     <BrowserRouter>
//       <Switch>
//         <Route path="/" exact component={CreateRoom} />
//         <Route path="/room/:roomID" component={Room} />
//       </Switch>
//     </BrowserRouter>
//   );
// }

// export default App;
// src/App.js
import React from "react";
import CallRoom from "./Callroom";

function App() {
  return (
    <div className="App">
      <CallRoom />
    </div>
  );
}

export default App;
