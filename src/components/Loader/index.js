import styled, { keyframes } from 'styled-components';

const loaderAimation = keyframes`
0% {
    transform: rotate(0deg);
}
100% {
    transform: rotate(360deg);
}
`;

export default styled.div`
border: 3px solid #f3f3f3;
border-top: 3px solid #3498db;
border-radius: 50%;
width: 100px;
height: 100px;
animation-name: ${loaderAimation};
animation-duration: 0.9s;
animation-iteration-count: infinite;
`;