import React from 'react';
import styled, { keyframes } from 'styled-components';
import {
  ResponsiveContainer,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  LineChart,
  Line,
  ReferenceLine,
  RadarChart,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
} from 'recharts';

// Mock Data for the Citizen Scorecard
const citizenData = {
  mainScore: 874, // Out of 1000
  rank: 'Exemplary Contributor (Tier A+)',
  rankDescription: 'Your unwavering commitment to societal harmony and economic productivity has been noted. Continue your valuable contributions.',
  scoreBreakdown: [
    { name: 'Fiscal Responsibility', score: 92, fullMark: 100 },
    { name: 'Social Compliance', score: 88, fullMark: 100 },
    { name: 'Economic Output', score: 95, fullMark: 100 },
    { name: 'Patriotic Engagement', score: 79, fullMark: 100 },
    { name: 'Digital Purity', score: 85, fullMark: 100 },
  ],
  historicalPerformance: [
    { month: 'Jan', score: 750 },
    { month: 'Feb', score: 765 },
    { month: 'Mar', score: 780 },
    { month: 'Apr', score: 810 },
    { month: 'May', score: 845 },
    { month: 'Jun', score: 874 },
  ],
  peerComparison: [
    {
      subject: 'Fiscal',
      user: 92,
      districtAverage: 75,
      nationalIdeal: 98,
    },
    {
      subject: 'Social',
      user: 88,
      districtAverage: 81,
      nationalIdeal: 95,
    },
    {
      subject: 'Economic',
      user: 95,
      districtAverage: 68,
      nationalIdeal: 97,
    },
    {
      subject: 'Patriotic',
      user: 79,
      districtAverage: 72,
      nationalIdeal: 90,
    },
    {
      subject: 'Digital',
      user: 85,
      districtAverage: 78,
      nationalIdeal: 92,
    },
  ],
};

// Keyframes for animations
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 56, 56, 0.7); }
  70% { transform: scale(1.02); box-shadow: 0 0 10px 20px rgba(255, 56, 56, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 56, 56, 0); }
`;

const glow = keyframes`
  from {
    text-shadow: 0 0 5px #fff, 0 0 10px #fff, 0 0 15px #00ff87, 0 0 20px #00ff87, 0 0 25px #00ff87, 0 0 30px #00ff87, 0 0 35px #00ff87;
  }
  to {
    text-shadow: 0 0 10px #fff, 0 0 15px #fff, 0 0 20px #00ff87, 0 0 25px #00ff87, 0 0 30px #00ff87, 0 0 35px #00ff87, 0 0 40px #00ff87;
  }
`;

// Styled Components
const CardWrapper = styled.div`
  background: linear-gradient(145deg, #1a1c20, #2a2d32);
  border: 1px solid #ff3838;
  border-radius: 12px;
  padding: 24px;
  color: #e0e0e0;
  font-family: 'Orbitron', sans-serif;
  box-shadow: 0 0 25px rgba(255, 56, 56, 0.4);
  animation: ${pulse} 3s infinite;
`;

const Header = styled.h2`
  text-align: center;
  font-size: 2.5rem;
  color: #ff3838;
  text-transform: uppercase;
  letter-spacing: 3px;
  margin-bottom: 20px;
  text-shadow: 0 0 10px #ff3838;
`;

const MainDisplayGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 2fr;
  gap: 24px;
  align-items: center;
  margin-bottom: 32px;
  border-bottom: 2px solid #444;
  padding-bottom: 32px;
`;

const ScoreGaugeContainer = styled.div`
  position: relative;
  width: 100%;
  height: 250px;
`;

const ScoreTextOverlay = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
`;

const MainScore = styled.div`
  font-size: 4rem;
  font-weight: 700;
  color: #42f5b0;
  animation: ${glow} 1.5s ease-in-out infinite alternate;
`;

const ScoreTotal = styled.div`
  font-size: 1.2rem;
  color: #a0a0a0;
`;

const RankInfoContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const CitizenRank = styled.h3`
  font-size: 2rem;
  color: #42f5b0;
  margin: 0;
  text-shadow: 0 0 8px #42f5b0;
`;

const RankDescription = styled.p`
  font-size: 1rem;
  color: #c0c0c0;
  line-height: 1.6;
  max-width: 500px;
  font-family: 'Roboto Mono', monospace;
`;

const ChartsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 24px;
`;

const ChartBox = styled.div`
  background: #22252a;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #333;
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
`;

const ChartTitle = styled.h4`
  text-align: center;
  color: #ff8c00;
  font-size: 1.2rem;
  margin-bottom: 20px;
  text-transform: uppercase;
`;

const CustomTooltip = styled.div`
  background-color: rgba(20, 20, 20, 0.9);
  border: 1px solid #ff3838;
  padding: 10px;
  color: #e0e0e0;
  border-radius: 5px;
  font-family: 'Roboto Mono', monospace;
`;

const TooltipLabel = styled.p`
  margin: 0;
  color: #ff8c00;
`;

const TooltipValue = styled.p`
  margin: 0;
  color: #42f5b0;
`;

const CustomChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <CustomTooltip>
        <TooltipLabel>{`${label}`}</TooltipLabel>
        {payload.map((pld: any, index: number) => (
          <TooltipValue key={index} style={{ color: pld.color }}>
            {`${pld.name}: ${pld.value}`}
          </TooltipValue>
        ))}
      </CustomTooltip>
    );
  }
  return null;
};

const CitizenScoreCard: React.FC = () => {
  const scorePercentage = (citizenData.mainScore / 1000) * 100;
  const gaugeData = [{ value: scorePercentage }];

  const getScoreColor = (score: number) => {
    if (score > 800) return '#42f5b0'; // Green
    if (score > 600) return '#ffdd57'; // Yellow
    return '#ff3838'; // Red
  };

  return (
    <CardWrapper>
      <Header>Citizen Scorecard</Header>
      <MainDisplayGrid>
        <ScoreGaugeContainer>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="70%"
              outerRadius="100%"
              data={gaugeData}
              startAngle={180}
              endAngle={-180}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                fill={getScoreColor(citizenData.mainScore)}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <ScoreTextOverlay>
            <MainScore>{citizenData.mainScore}</MainScore>
            <ScoreTotal>/ 1000</ScoreTotal>
          </ScoreTextOverlay>
        </ScoreGaugeContainer>
        <RankInfoContainer>
          <CitizenRank>{citizenData.rank}</CitizenRank>
          <RankDescription>{citizenData.rankDescription}</RankDescription>
        </RankInfoContainer>
      </MainDisplayGrid>

      <ChartsGrid>
        <ChartBox>
          <ChartTitle>Core Metric Analysis</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={citizenData.scoreBreakdown} layout="vertical" margin={{ top: 5, right: 20, left: 100, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis type="number" domain={[0, 100]} stroke="#888" />
              <YAxis type="category" dataKey="name" stroke="#888" width={120} />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.1)' }} />
              <Bar dataKey="score" fill="#ff8c00" barSize={20} />
            </BarChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox>
          <ChartTitle>Historical Performance Trajectory</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={citizenData.historicalPerformance} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#444" />
              <XAxis dataKey="month" stroke="#888" />
              <YAxis domain={[700, 1000]} stroke="#888" />
              <Tooltip content={<CustomChartTooltip />} />
              <Legend />
              <ReferenceLine y={750} label="Minimum Compliance Threshold" stroke="#ff3838" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="score" name="Your Score" stroke="#42f5b0" strokeWidth={3} dot={{ r: 5 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </ChartBox>

        <ChartBox>
          <ChartTitle>Peer Compliance Comparison</ChartTitle>
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={citizenData.peerComparison}>
              <PolarGrid stroke="#555" />
              <PolarAngleAxis dataKey="subject" stroke="#e0e0e0" />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip content={<CustomChartTooltip />} />
              <Radar name="Your Contribution" dataKey="user" stroke="#42f5b0" fill="#42f5b0" fillOpacity={0.6} />
              <Radar name="District Average" dataKey="districtAverage" stroke="#ffdd57" fill="#ffdd57" fillOpacity={0.4} />
              <Radar name="National Ideal" dataKey="nationalIdeal" stroke="#ff3838" fill="#ff3838" fillOpacity={0.2} />
              <Legend />
            </RadarChart>
          </ResponsiveContainer>
        </ChartBox>
      </ChartsGrid>
    </CardWrapper>
  );
};

export default CitizenScoreCard;