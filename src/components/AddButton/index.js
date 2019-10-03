import React from 'react';
import styled from 'styled-components';

const ButtonOuter = styled.div`
position: absolute;
right: 40px;
display: flex;
align-items: center;
justify-content: center;
`;

const Label = styled.div`
font-size: 18px;
margin-right:10px;
`;

const AddButton = styled.button`
width: 30px;
height: 30px;
border-radius: 50%;
font-size: 25px;
border: none;
outline: none;
background-color: white;
color: grey;
cursor: pointer;

&:active, &:hover {
    background-color: green;
    color: white;
}
`;

export default ({ visible, title, children, onClick }) => {

    if (!visible) {
        return null;
    }

    return (
        <ButtonOuter>
            {title &&
                <Label>{title}</Label>
            }
            <AddButton onClick={onClick}>+</AddButton>
        </ButtonOuter>        
    );
};