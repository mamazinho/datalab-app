import React from 'react';
import {
  FeatureCard,
  FeatureDescription,
  FeatureGrid,
  FeatureIcon,
  FeatureLink,
  FeatureTitle,
  Hero,
  HeroBadge,
  HeroHighlight,
  HeroText,
  HeroTitle,
  HomeContainer,
  HomeContent,
} from './home.style';
import { useAuthContext } from '../../contexts/auth';
import { extractFirstName } from '../../utils/extractors';

export const Home: React.FC = () => {
  const { me } = useAuthContext();

  return (
    <HomeContainer>
      <HomeContent>
        
        <Hero>
          <HeroBadge>
            <span aria-hidden="true">🚀</span>
          </HeroBadge>
          <HeroTitle>
            DataLab <HeroHighlight>App</HeroHighlight>
          </HeroTitle>
          <HeroText>
            Bem-vindo a DataLab, {extractFirstName(me.name)}! Escolha uma das opções abaixo para começar a explorar nossos recursos de inteligência.
          </HeroText>
        </Hero>
        
        <FeatureGrid>
          <FeatureCard>
            <FeatureIcon>
              <span aria-hidden="true">🤖</span>
            </FeatureIcon>
            <FeatureTitle>DataLab AI</FeatureTitle>
            <FeatureDescription>
                Converse com nossa inteligência artificial e tire suas dúvidas em tempo real.
            </FeatureDescription>
            <FeatureLink to="/ia/conversas">
                Acessar conversas
            </FeatureLink>
          </FeatureCard>
        </FeatureGrid>
      </HomeContent>
    </HomeContainer>
  );
};
