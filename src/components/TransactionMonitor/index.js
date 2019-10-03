import React, { Component, createContext, useContext } from 'react';
import styled from 'styled-components';

import AppContext from '../../AppContext';
import Loader from '../Loader';

export const TransactionContext = createContext();

const TransactionOverlay = styled.div`
z-index: 9898989898;
position: fixed;
top: 0;
bottom: 0;
left: 0;
right: 0;
height: 100vh;
width: 100vw;
display: flex;
flex-flow: column;
justify-content: center;
align-items: center;
background: rgba(68,81,89,0.65);
`;

const LoaderOuter = styled.div`
width: 100px;

div {
    margin-bottom: 15px;
}

p {
    text-align: center;
    color: white;
}
`;

const TransactionMonitor = ({ transaction, onSuccess, onError }) => {
    const { arweave } = useContext(AppContext);

    if (!transaction) {
        return null;
    }

    const interval = setInterval(async () => {
        try {
            const { status, confirmed } = await arweave.transactions.getStatus(transaction);

            if (status === 400 || status === 500) {
                onError(new Error('Transaction failed')); 
                return clearInterval(interval);   
            }

            if (confirmed && confirmed.number_of_confirmations >= 1) {
                onSuccess(); 
                return clearInterval(interval); 
            }
        } catch(error) {
            onError(error);
            clearInterval(interval);
        }
    }, 3000);

    return (
        <LoaderOuter>
            <Loader />
            <p>
               Please Wait for the transaction to be mined on the Blockchain. 
            </p>
        </LoaderOuter>
    );
};

export default class Tm extends Component {
    state = {
        transaction: false,
        onSuccess: () => {},
        onError: () => {}
    };

    render() {
        const { transaction, onSuccess, onError } = this.state;
        const { children } = this.props;

        return (
            <TransactionContext.Provider value={(transaction, onSuccess, onError) => this.setState({
                transaction, 
                onSuccess, 
                onError
            })}>
                {transaction &&
                    <TransactionOverlay>
                        <TransactionMonitor 
                            transaction={transaction} 
                            onSuccess={() => {
                                this.setState({
                                    transaction: false
                                });
                                onSuccess();
                            }} 
                            onError={error => {
                                this.setState({
                                    transaction: false
                                });
                                onError(error);
                            }}
                        />
                    </TransactionOverlay>
                }
                {children}
            </TransactionContext.Provider>
        );
    };
}
