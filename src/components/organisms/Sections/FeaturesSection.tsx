import { Box, Grid } from '@chakra-ui/react'
import FeatureCard from '../Cards/FeatureCard'
import { FeatureCardProps } from '../types/types';
import CardHeartIcon from '@/components/atoms/Icons/home/CardHeartIcon';
import CardTrendingIcon from '@/components/atoms/Icons/home/CardTrendingIcon';
import CardZapIcon from '@/components/atoms/Icons/home/CardZapIcon';
import CardLayersIcon from '@/components/atoms/Icons/home/CardLayersIcon';
import CardMonitorIcon from '@/components/atoms/Icons/home/CardMonitorIcon';
import CardUserIcon from '@/components/atoms/Icons/home/CardUserIcon';

const iconSize = 32

const featureCards: FeatureCardProps[] = [
  {
    title: "Увеличение лояльности клиентов",
    description:
      "Создаем более глубокую связь с аудиторией и помогаем повысить уровень их лояльности",
    icon: <CardHeartIcon width={iconSize} height={iconSize}/>,
  },
  {
    title: "Рост конверсии на 30-40%",
    description:
      "Благодаря персонализированным и целенаправленным коммуникациям",
    icon: <CardTrendingIcon width={iconSize} height={iconSize}/>,
  },
  {
    title: "Автоматизация процессов",
    description: "Сокращаем время на выполнение рутинных задач",
    icon: <CardZapIcon width={iconSize} height={iconSize}/>,
  },
  {
    title: "Единая история взаимодействий",
    description: "Объединяем все контакты клиентов с брендом в одном месте",
    icon: <CardLayersIcon width={iconSize} height={iconSize}/>,
  },
  {
    title: "Аналитика в реальном времени",
    description:
      "Позволяет мгновенно отслеживать эффективность кампаний, адаптируя стратегию",
    icon: <CardMonitorIcon width={iconSize} height={iconSize}/>,
  },
  {
    title: "Персонализация коммуникаций",
    description:
      "Увеличиваем вовлеченность клиентов, адаптируя сообщения под их интересы",
    icon: <CardUserIcon width={iconSize} height={iconSize}/>,
  },
];

export default function FeaturesSection() {
    return (
        <Box as="section" id='features'>
            <Grid
                mt={{ base: 12, md: 24 }}
                maxW={{ base: "328px", md: "736px", xl: "1400px" }}
                mx="auto"
                templateColumns={{
                    base: "1fr",
                    md: "repeat(2, 1fr)",
                    xl: "repeat(3, 1fr)",
                }}
                gap="20px"
            >
                {featureCards.map(({title, description, icon}) => (
                    <FeatureCard key={title} title={title} description={description} icon={icon} />
                ))}
            </Grid>
        </Box>
    )
}
