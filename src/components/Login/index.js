import React, { Component } from 'react';
import styled from 'styled-components';

import AppContext from '../../AppContext';
import AddressLink from '../AddressLink';

const LogitOuter = styled.div`
cursor: pointer;
height: 200px;
border: 2px dashed #62666f;
text-align: center;
display: flex;
flex-direction: column;
align-items: center;
justify-content: center;
position: relative;
margin: auto;
max-width: 300px;
`;

const Label = styled.div`
color: grey;
`;

const Info = styled.div`
color: grey;
`;

const FileDrop = styled.input`
opacity: 0;
position: absolute;
background: none;
width: 100%;
height: 100%;
`;

class ProjectsList extends Component {

    state = {
        balanceInterval: null,
        ballance: 0
    };

    balanceFetcher = (arweave, address) => {

        clearInterval(this.state.balanceInterval);
        const balanceInterval = setInterval(async () => {
            try {
                const balance = await arweave.wallets.getBalance(address);
                this.setState({
                    balance: arweave.ar.winstonToAr(balance)
                });
            } catch(error) {}
        }, 2000);
        this.setState({
            balanceInterval
        });
    }

    processFile = (arweave, files, setloggedIn) => {
        const fr = new FileReader();
    
        fr.onload = async (ev) => {
            try {
                const wallet = JSON.parse(ev.target.result);
                const address = await arweave.wallets.jwkToAddress(wallet);            
                setloggedIn(address, wallet);
                this.balanceFetcher(arweave, address);
            } catch (err) {
                console.log('Error logging in: ', err);
            }
        };
    
        fr.readAsText(files[0]);
    }

    render() {
        const { balance } = this.state;
        const { arweave, loggedIn, setloggedIn } = this.context;

        if (loggedIn) {
            return (
                <AddressLink address={loggedIn} balance={balance} />
            );
        }

        return (
            <div>
                <LogitOuter>
                    <FileDrop
                        type="file" 
                        onChange={({target: { files }}) => this.processFile(arweave, files, setloggedIn)}
                    />
                    <Label>Drop a wallet keyfile to log in</Label>                
                </LogitOuter>
                <Info>Don't have a wallet? Get one <a href="https://tokens.arweave.org/" rel="noopener noreferrer" target="_blank">here</a>!</Info>
            </div>
        );
    };
};

ProjectsList.contextType = AppContext;

export default ProjectsList;
