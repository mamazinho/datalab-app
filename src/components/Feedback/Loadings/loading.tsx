import { LoadingContainer, LoadingText, Spinner } from './loading.style';

export const LoadingPiece = () => {
    return (
        <LoadingContainer>
            <Spinner />
            <LoadingText>Loading...</LoadingText>
        </LoadingContainer>
    );
}