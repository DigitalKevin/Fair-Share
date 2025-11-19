import React, { useState } from 'react';
import PeopleForm from './components/PeopleForm';
import ExpenseForm from './components/ExpenseForm';
import ExpenseList from './components/ExpenseList';
import Balances from './components/Balances';

export default function App() {
  const [refreshSignal, setRefreshSignal] = useState(0);

  function bump() { setRefreshSignal(s=>s+1); }

  return (
    <div className="container">
      <div className="header">
        <h1>FairShare</h1>
        <div className="small">Split expenses with friends</div>
      </div>

      <div style={{marginTop:12}} className="grid">
        <div>
          <PeopleForm onAdded={bump} />
          <ExpenseForm onAdded={bump} />
        </div>
        <div>
          <Balances refreshSignal={refreshSignal} />
        </div>
      </div>

      <div style={{marginTop:12}}>
        <ExpenseList refreshSignal={refreshSignal} />
      </div>
    </div>
  );
}
