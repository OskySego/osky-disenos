import styled from 'styled-components';

export const TarjetaBeneficio = styled.article`
  width: 100%;
  height: 100%;

  @media (prefers-reduced-motion: reduce) {
    transition: none;

    &:hover {
      transform: none;
    }
  }
`;