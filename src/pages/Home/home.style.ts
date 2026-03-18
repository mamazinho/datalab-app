import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const HomeContainer = styled.div`
  width: 100%;
`;

export const HomeContent = styled.div`
  width: min(100%, 76rem);
  margin: 0 auto;
  padding: 2.5rem 1rem 3rem;

  @media (min-width: 768px) {
    padding: 3rem 1.5rem 3.5rem;
  }
`;

export const Hero = styled.section`
  margin: 2rem auto 3rem;
  max-width: 48rem;
  text-align: center;
  animation: floatIn 0.35s ease;
`;

export const HeroBadge = styled.div`
  width: 4.2rem;
  height: 4.2rem;
  margin: 0 auto 1.1rem;
  border-radius: 1.2rem;
  display: grid;
  place-items: center;
  background: linear-gradient(150deg, ${({ theme }) => theme.colors.surfaceAlt}, ${({ theme }) => theme.colors.primary});
  box-shadow: 0 14px 24px ${({ theme }) => theme.colors.shadow};
`;

export const HeroTitle = styled.h1`
  margin: 0 0 0.8rem;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.12;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.text};
`;

export const HeroHighlight = styled.span`
  color: ${({ theme }) => theme.colors.primary};
`;

export const HeroText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1rem, 2.1vw, 1.2rem);
`;

export const FeatureGrid = styled.section`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.25rem;

  @media (min-width: 900px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

export const FeatureCard = styled.article`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 1.1rem;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 10px 18px ${({ theme }) => theme.colors.shadow};
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 14px 24px ${({ theme }) => theme.colors.shadow};
  }
`;

export const FeatureIcon = styled.div`
  width: 3rem;
  height: 3rem;
  border-radius: 0.8rem;
  display: grid;
  place-items: center;
  margin-bottom: 1rem;
  background: ${({ theme }) => theme.colors.surfaceAlt};
`;

export const FeatureTitle = styled.h5`
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.colors.text};
`;

export const FeatureDescription = styled.p`
  margin: 0 0 1rem;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex: 1;
`;

export const FeatureLink = styled(Link)`
  margin-top: auto;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  border-radius: 0.8rem;
  padding: 0.78rem 1rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.primaryText};
  background: ${({ theme }) => theme.colors.primary};
  transition: filter 0.16s ease, transform 0.16s ease;

  &:hover {
    filter: brightness(0.95);
  }

  &:active {
    transform: scale(0.985);
  }
`;
