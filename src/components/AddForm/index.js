import React, { useContext, useState } from 'react';
import styled from 'styled-components';

import packageJson from '../../../package.json';
import AppContext from '../../AppContext';
import { TransactionContext } from '../../components/TransactionMonitor';
import ErrorMessage from '../Error';

const FormOuter = styled.div`
display: flex;
flex-direction: column;
align-items: stretch;
justify-content: flex-start;
background-color: whitesmoke;
margin: 10px auto;
padding: 20px;
width: 60%;
border-radius: 5px;

button[type=submit] {
    border: none;
    outline: none;
    cursor: pointer;
    padding: 10px 30px;
    background-color: #4a0072;
    color: white;
    font-size: 16px;
    border-radius: 8px;
}
`;

const FieldOuter = styled.div`
display: flex;
flex-direction: row;
align-items: center;
justify-content: stretch;
margin-bottom: 10px;

input, textarea {
    font-size: 16px;
    padding: 4px;
    flex-grow: 1;
    
    ::placeholder {
        opacity: 0.4;
    }
}

.label {
    margin-right: 5px;
    flex-grow: 0;
    width: 100px;
    text-align: right;
}
`;

const Label = styled.div`
font-size: 14px;
font-weight: bold;
color: gray;
`;

const Field = ({
    label, 
    type,
    placeholder,
    value,
    step,
    onChange = () => {},
}) => {

    return (
        <FieldOuter>
            <Label className="label">{label}</Label>
            <input 
                type={type} 
                placeholder={placeholder} 
                value={value}
                step={step}
                onChange={({ target: { value }}) => onChange(value)}
            />
        </FieldOuter>
    );
};

const Textarea = ({
    label, 
    rows,
    placeholder,
    value,
    onChange = () => {},
}) => {

    return (
        <FieldOuter>
            <Label className="label">{label}</Label>
            <textarea 
                rows={rows} 
                placeholder={placeholder} 
                value={value}
                onChange={({ target: { value }}) => onChange(value)}
            />
        </FieldOuter>
    );
};

const validateProjectDetails = ({
    name,
    description,
    address,
    target
}) => {
    
    if (!name  || name === '') {
        throw new Error('The Prediction title should not be empty');
    }

    if (!description  || description === '') {
        throw new Error('The description should not be empty');
    }

    if (description.length > 500) {
        throw new Error('the description is too long (should not be more then 500 symbols)');
    }

    if (!address  || address.match(/^[a-zA-Z0-9-]{43}$/ig) === null) {
        throw new Error('your address should not be empty and should be a valid AR address');
    }

    if (!target  || target === '') {
        throw new Error('Please input the date of when the Prediction will happen');
    }
};

const cleanText = text => String(text).replace(/(\b)(on\S+)(\s*)=|javascript|(<\s*)(\/*)script/gim, '');

const processAdd = async (
    arweave, 
    wallet,
    projectDetails, 
    onSuccess = () => {}, 
    onError = () => {}
) => {
    try {
        projectDetails.name = cleanText(projectDetails.name);
        projectDetails.description = cleanText(projectDetails.description);
        validateProjectDetails(projectDetails);        
        const transaction = await arweave.createTransaction({
            data: JSON.stringify(projectDetails),
        }, wallet);
        transaction.addTag('App-Name', packageJson.name);
        transaction.addTag('App-Version', packageJson.version);
        transaction.addTag('Unix-Time', Math.round((new Date()).getTime() / 1000));
        transaction.addTag('Type', 'presage');
        await arweave.transactions.sign(transaction, wallet);
        const response = await arweave.transactions.post(transaction);

        if (response.status === 400 || response.status === 500) {
            return onError(new Error('Transaction failed'));
        }

        onSuccess(transaction.id);
    } catch (error) {
        console.log(error);
        onError(error);
    }
};

export default ({ onSuccess = () => {} }) => {
    const { arweave, wallet, loggedIn, addFormOpened, setAddFormOpened } = useContext(AppContext);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [address, setAddress] = useState(loggedIn || '');
    const [target, setTarget] = useState('');
    const [error, setError] = useState(false);
    const transactionMonitor = useContext(TransactionContext);

    setTimeout(() => setAddress(loggedIn), 500);

    if (!loggedIn || !addFormOpened) {
        return null;
    }

    return (
        <div>
            <FormOuter>
                <Field 
                    label="Prediction"
                    type="text"
                    placeholder="prediction title" 
                    value={name}
                    onChange={setName}
                />
                <Textarea 
                    label="Description"
                    rows="4"
                    placeholder="prediction description" 
                    value={description}
                    onChange={setDescription}
                />
                <Field 
                    type="hidden"
                    value={address}
                    onChange={setAddress}
                />
                <Field 
                    label="Predicted date"
                    type="date"
                    placeholder="DD/MM/YYYY" 
                    value={target}
                    onChange={setTarget}
                />
                <div>
                    <button 
                        type="submit"
                        onClick={() => processAdd(
                            arweave, 
                            wallet,
                            {
                                name,
                                description,
                                address,
                                target
                            }, 
                            tx => transactionMonitor(
                                tx,
                                () => setTimeout(() => {
                                    setAddFormOpened(false);
                                    onSuccess(tx);
                                }, 1500),
                                error => {
                                    setError(error);
                                    setAddFormOpened(false);
                                }    
                            ),
                            setError
                        )}
                    >Submit My Prediction</button>
                </div>
                <ErrorMessage error={error} onClose={() => setError(false)} />
            </FormOuter>
        </div>
    );
};