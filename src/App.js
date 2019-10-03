import React, { Component } from 'react';
import styled from 'styled-components';

import AppContext, { arweave } from './AppContext';
import TransactionMonitor from './components/TransactionMonitor';
import Login from './components/Login';
import AddButton from './components/AddButton';
import ProjectsList from './components/ProjectsList';

const Content = styled.div`
margin-top: 20px;
`;

class App extends Component {
    state = {
        loggedIn: false,
        wallet: false,
        addFormOpened: false
    };
    render() {
        return (
            <AppContext.Provider value={{
                arweave,
                ...this.state,
                setloggedIn: (loggedIn, wallet) => this.setState({
                    loggedIn,
                    wallet
                }),
                setAddFormOpened: addFormOpened => this.setState({
                    addFormOpened
                })
            }}>
                <TransactionMonitor>
                    <div className="App">
                        <div className="App-header">
                            <p>PRESAGE - Prediction dApp</p>
                            <AddButton
                                visible={this.state.loggedIn && !this.state.addFormOpened}
                                title="Add your Prediction"
                                onClick={() => this.setState({
                                    addFormOpened: true
                                })}
                            />
                        </div>
                        <Content>
                            <Login />
                            <ProjectsList />
                        </Content> 
                    </div>
                </TransactionMonitor>
            </AppContext.Provider>             
        );
    }
}

export default App;
