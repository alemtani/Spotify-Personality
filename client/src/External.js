import { useParams } from 'react-router-dom';

export default function External() {
    const type = useParams();
    window.location.href = `https://16personalities.com/${type}/-personality`;
    return null;
}