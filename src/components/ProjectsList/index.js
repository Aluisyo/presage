import React, { Component, useState } from 'react';
import styled from 'styled-components';

import packageJson from '../../../package.json';
import AppContext from '../../AppContext';
import { TransactionContext } from '../TransactionMonitor';
import ErrorMsg from '../Error';
import Loader from '../Loader';
import AddForm from '../AddForm';
import AddressLink from '../AddressLink';

const ListOuter = styled.div`
margin: 20px auto;
width: 80%;
min-width: 450px;
`;

const LoadingOuter = styled.div`
margin-top: 20px;
display: flex;
align-items: center;
justify-content: center;
`;

const Row = styled.div`
display: flex;
flex-direction: row;
align-items: flex-start;
justify-content: stretch;
padding: 10px 5px;
border-bottom: 5px solid rgba(0,0,0,0.3);

&:first-child {
    border-top: 5px solid rgba(0,0,0,0.3);
}

&:hover {
    background-color: rgba(0,0,0,0.1);

    a {
        color: #282C34;
    }
}
`;

const Column = styled.div`
display: flex;
flex-direction: column;
flex-basis: 0;
flex-grow: 1;
${({ textAlign }) => { return `text-align: ${textAlign};`; }}
`;

const TitleOuter = styled.div`
text-align: left;
`;

const Details = styled.div`

text-align: left;
`;

const Target = styled.div`

`;

const Title = ({ children, details }) => {
    const [opened, setOpened] = useState(false);

    return (
        <TitleOuter 
            title="Click on title to view details" 
            onClick={() => setOpened(!opened)}
        >
            {children}
            {opened &&
                <div>
                    <Details>
                        {details.description}
                    </Details>
                    <Details>
                        By: <AddressLink address={details.address} />
                    </Details>
                </div>
            }
        </TitleOuter>
    );
};

const BackproBtn = styled.button`
border: none;
outline: none;
cursor: pointer;
padding: 4px 6px;
background-color: #8e24aa;
color: white;
font-size: 14px;

&:hover {
    background-color: #c158dc;
    color: white;
}
`;

const DonateOuter = styled.div`
display: flex;
flex-direction: row;
justify-content: flex-end;
align-self: flex-end;
width: 150px;
text-align: right;
`;

const DonateForm = styled.div`
display: flex;
flex-direction: row;
flex-wrap: nowrap;

input[type=number] {
    font-size: 14px;
    margin-right: 10px;
    width: 90px;
}

button {
    border: none;
    outline: none;
    cursor: pointer;

    &:hover {
        background-color: white;
    }
}

button[type=submit] {
    font-size: 14px;
    margin-right: 10px;
}

button[type=cancel] {
    font-size: 12px;
    color: white;
    width: 24px;
    height: 24px;
    border-radius: 50%;

    &:hover {
        color: red;
    }
}
`;

const Donate = ({ onSubmit = () => {} }) => {
    const [opened, setOpened] = useState(false);
    const [amount, setAmount] = useState(0.1);

    return (
        <DonateOuter>
            {!opened &&
                <BackproBtn onClick={() => setOpened(!opened)}>
                    Tip this prediction
                </BackproBtn>
            }
            {opened &&
                <DonateForm>
                    <input 
                        type="number"
                        value={amount} 
                        min="0.000001"
                        onChange={({ target: { value }}) => setAmount(value)}
                    />
                    <button
                        type="submit"
                        onClick={() => {
                            setOpened(!opened);
                            onSubmit(amount);
                        }}
                    >Tip</button>
                    <button
                        type="cancel"
                        onClick={() => setOpened(!opened)}
                    >X</button>
                </DonateForm>
            }
        </DonateOuter>
    );
};

class ProjectsList extends Component {
    state = {
        loading: false,
        error: false,
        records: []
    };

    setStateAsync = state => new Promise(resolve => this.setState(state, resolve));

    fetchEarnings = async (id) => {
        try {
            const { arweave } = this.context;

            const txids = await arweave.arql({
                op: 'and',
                expr1: {
                    op: 'equals',
                    expr1: 'App-Name',
                    expr2: packageJson.name
                },
                expr2: {
                    op: 'and',
                    expr1: {
                        op: 'equals',
                        expr1: 'App-Version',
                        expr2: packageJson.version
                    },
                    expr2: {
                        op: 'and',
                        expr1: {
                            op: 'equals',
                            expr1: 'Type',
                            expr2: 'presage-tips'
                        },
                        expr2: {
                            op: 'equals',
                            expr1: 'Predictions',
                            expr2: id
                        }
                    }                    
                }
            });

            const records = await Promise.all(txids.map(async (tx) => {
                const transaction = await arweave.transactions.get(tx);
                const from = await arweave.wallets.ownerToAddress(transaction.get('owner'));
                return {
                    project: id,
                    id: transaction.get('id'),
                    from,
                    transaction,
                    quantity: arweave.ar.winstonToAr(transaction.get('quantity'))
                };
            }));

            return records;
        } catch(error) {
            this.setState({
                error
            });
        }
    };

    fetchList = async () => {
        try {
            const { arweave } = this.context;

            await this.setStateAsync({
                loading: true
            });

            const txids = await arweave.arql({
                op: 'and',
                expr1: {
                    op: 'equals',
                    expr1: 'App-Name',
                    expr2: packageJson.name
                },
                expr2: {
                    op: 'and',
                    expr1: {
                        op: 'equals',
                        expr1: 'App-Version',
                        expr2: packageJson.version
                    },
                    expr2: {
                        op: 'equals',
                        expr1: 'Type',
                        expr2: 'presage'
                    }                    
                }
            });

            const records = await Promise.all(txids.map(async (tx) => {
                const earnings = await this.fetchEarnings(tx);
                const transaction = await arweave.transactions.get(tx);
                const {
                    name,
                    description,
                    address,
                    target
                } = JSON.parse(transaction.get('data', {
                    decode: true, 
                    string: true
                }));
                return {
                    id: transaction.get('id'),
                    name,
                    description,
                    address,
                    target,
                    earnings,
                    transaction
                };
            }));

            console.log('Predictions:', records);

            await this.setStateAsync({
                loading: false,
                records
            });
        } catch(error) {
            this.setState({
                error
            });
        }
    };

    sendDonation = async (id, target, quantity, transactionContext) => {
        try {
            const { arweave, wallet, loggedIn } = this.context;
            const transactionMonitor = transactionContext;
            const balance = await arweave.wallets.getBalance(loggedIn);
            const arBalance = arweave.ar.winstonToAr(balance);

            if (Number(arBalance) < (Number(quantity) + 0.26)) {
                throw new Error('Insufficient funds in your account');
            }
            
            const transaction = await arweave.createTransaction({
                quantity: arweave.ar.arToWinston(quantity),
                target
            }, wallet);
            transaction.addTag('App-Name', packageJson.name);
            transaction.addTag('App-Version', packageJson.version);
            transaction.addTag('Unix-Time', Math.round((new Date()).getTime() / 1000));
            transaction.addTag('Type', 'presage-tips');
            transaction.addTag('Predictions', id);
            await arweave.transactions.sign(transaction, wallet);
            const response = await arweave.transactions.post(transaction);

            if (response.status === 400 || response.status === 500) {
                throw new Error('Transaction failed');
            }

            transactionMonitor(
                transaction.id, 
                () => setTimeout(() => this.fetchList(), 1500),
                error => this.setState({
                    error
                })
            );
        } catch(error) {
            this.setState({
                error
            });
        }
    };

    componentDidMount = () => {
        const { records } = this.state;

        if (records.length === 0) {
            this.fetchList();
        }
    }



    render() {
        const { records, loading, error } = this.state;
        const { loggedIn } = this.context;
        const erns = records.map(r => r.earnings.reduce((acc, cv) => acc + Number(cv.quantity), 0));
		
        return (
            <div>
                <AddForm onSuccess={() => this.fetchList()}/>
                <ListOuter>
                    {(records && records.length > 0) && 
                        <TransactionContext.Consumer>
                            {(transactionContext) => records.map((r, i) => (
                                <Row key={i}>
                                    <Column>
                                        <Title details={r}>
                                            <strong>{r.name}</strong>
                                        </Title>
                                    </Column>
                                    <Column>
                                        <Target>Predicted Date: {r.target}</Target>
                                    </Column>
									<Column textAlign="right">
                                        {erns[i].toFixed(2)} (AR) Earned
                                    </Column>
                                    <Column>
                                        {(loggedIn && r.address !== loggedIn) &&
                                            <Donate 
                                                project={r.id}
                                                onSubmit={(quantity) => this.sendDonation(r.id, r.address, quantity, transactionContext)}
                                            />
                                        }
                                    </Column>                                    
                                </Row>
                            ))}
                        </TransactionContext.Consumer>                    
                    }
                    {loading &&
                        <LoadingOuter><Loader /></LoadingOuter>
                    }
                    <ErrorMsg error={error} onClose={() => this.setState({
                        error: false
                    })} />
                </ListOuter>           
            </div>            
        );
    }
}

ProjectsList.contextType = AppContext;

export default ProjectsList;
