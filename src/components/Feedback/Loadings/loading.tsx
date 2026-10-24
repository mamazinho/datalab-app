import styles from './loading.module.css';

export const LoadingPiece = () => {
    return (
        <div className={styles.loadingContainer}>
            <div className={styles.spinner} />
            <h2 className={styles.loadingText}>Loading...</h2>
        </div>
    );
}