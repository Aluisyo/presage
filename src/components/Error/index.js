import React from 'react';
import styled from 'styled-components';

const ErrorOuter = styled.div`
position: relative;
background-color: red
padding: 15px;
margin-top: 10px;
border-radius: 5px;
font-size: 14px;
color: white;
`;

const CloseBtn = styled.button`
position: absolute;
top: 5px;
right: 5px;
border: none;
outline: none;
cursor: pointer;
background-color: white;
color: grey;
font-size: 10px;
width: 17px;
height: 17px;
border-radius: 50%;
`;

export default ({ error, onClose }) => {

    if (!error) {
        return null;
    }

    console.log('>>>', error);

    return (
        <ErrorOuter>
            <CloseBtn onClick={onClose}>x</CloseBtn>
            {error.message}
        </ErrorOuter>
    );
};