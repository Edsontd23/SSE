import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    const eventSource = new EventSource('http://localhost:3001/events');

    eventSource.onmessage = (event) => {
      let body_react = document.getElementById('body_crm')
      body_react.innerHTML = ''
      const data = JSON.parse(event.data);
      setUpdates(prevUpdates => [...prevUpdates, data]);
    };

    return () => {
      eventSource.close();
    };
  }, []);

  return (
    <div className="App">
      <div className="card">
        <h1 className='card-header'>PostgreSQL SSE Updates</h1>
        <div className="card-body">
          <div className="row" id='body_crm'>
          {updates.map((update, index) => (
            Object.keys(update).map((data,i)=>(
              <div class="col-xl-4 col-lg-6 col-md-6 col-sm-12 col-12">
                <div class="form-group form-control-sm">
                  <label for={data}>{data}:</label>
                  <input class="form-control" disabled type="text" id={data} name={data} required="true" placeholder={update[data]}/>
                </div>
              </div>
            ))
          ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
