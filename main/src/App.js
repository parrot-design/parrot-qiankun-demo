 
import './App.css';

function App() {
  return (
    <div className="App">
      <div className="App-Header">
        <button onClick={()=>window.history.pushState({},' ' ,'/pre-react') }>18-pre-react</button>
        <button onClick={()=>window.history.pushState({},' ' ,'/vue2') }>vue2</button>
        <button onClick={()=>window.history.pushState({},' ' ,'/vue3') }>vue3</button>
      </div>
      <div className="App-Container" id="container">

      </div>
    </div>
  );
}

export default App;
