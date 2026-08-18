import React, { useState, ReactNode } from 'react';
import styled, { css, keyframes } from 'styled-components';

/**
 * @typedef {'top' | 'bottom' | 'left' | 'right'} TooltipPosition
 * The possible positions for the tooltip relative to its trigger element.
 */
type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';

/**
 * @interface ExplanationTooltipProps
 * @property {ReactNode} children - The element that will trigger the tooltip on hover.
 * @property {string} title - The grand, authoritative title for the lecture within the tooltip.
 * @property {ReactNode} explanation - The detailed, comprehensive, and possibly overwhelming explanation. Can be a string or complex JSX.
 * @property {TooltipPosition} [position='top'] - The desired position of the tooltip. Defaults to 'top'.
 */
export interface ExplanationTooltipProps {
  children: ReactNode;
  title: string;
  explanation: ReactNode;
  position?: TooltipPosition;
}

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const topPosition = css`
  bottom: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);

  &::after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: #0a2d4d transparent transparent transparent;
  }
`;

const bottomPosition = css`
  top: calc(100% + 12px);
  left: 50%;
  transform: translateX(-50%);

  &::after {
    content: '';
    position: absolute;
    bottom: 100%;
    left: 50%;
    margin-left: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: transparent transparent #0a2d4d transparent;
  }
`;

const leftPosition = css`
  right: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 100%;
    margin-top: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: transparent transparent transparent #0a2d4d;
  }
`;

const rightPosition = css`
  left: calc(100% + 12px);
  top: 50%;
  transform: translateY(-50%);

  &::after {
    content: '';
    position: absolute;
    top: 50%;
    right: 100%;
    margin-top: -8px;
    border-width: 8px;
    border-style: solid;
    border-color: transparent #0a2d4d transparent transparent;
  }
`;

const TooltipBox = styled.div<{ isVisible: boolean; position: TooltipPosition }>`
  position: absolute;
  z-index: 9999;
  width: 400px;
  max-width: 90vw;
  padding: 1.5rem;
  background-color: #fdfdf5; /* A distinguished, parchment-like color */
  color: #2c3e50;
  border: 2px solid #0a2d4d; /* A strong, confident border */
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  font-family: 'Georgia', 'Times New Roman', serif;
  text-align: left;
  line-height: 1.7;
  pointer-events: none; /* The tooltip itself shouldn't be interactive */

  visibility: ${props => (props.isVisible ? 'visible' : 'hidden')};
  opacity: ${props => (props.isVisible ? 1 : 0)};
  transition: opacity 0.25s ease-in-out, visibility 0.25s ease-in-out;
  animation: ${props => (props.isVisible ? css`${fadeIn} 0.25s ease-in-out` : 'none')};

  ${({ position }) => {
    switch (position) {
      case 'bottom':
        return bottomPosition;
      case 'left':
        return leftPosition;
      case 'right':
        return rightPosition;
      case 'top':
      default:
        return topPosition;
    }
  }}

  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 1rem;
    color: #0a2d4d; /* A deep, sovereign blue */
    border-bottom: 2px solid #d3c0a5; /* A touch of gold */
    padding-bottom: 0.75rem;
  }

  p, div, span {
    font-size: 1rem;
    margin: 0 0 1rem 0;
  }

  *:last-child {
    margin-bottom: 0;
  }
`;

const TooltipWrapper = styled.span`
  position: relative;
  display: inline-block;
  cursor: help;
  border-bottom: 2px dotted rgba(10, 45, 77, 0.5); /* Subtle hint of interactivity */
`;

/**
 * A tooltip component designed not merely to inform, but to educate.
 * On hover, it reveals a comprehensive explanation, styled to resemble a
 * page from a scholarly journal. It's the digital equivalent of a professor
 * clearing their throat before launching into a detailed lecture.
 *
 * @param {ExplanationTooltipProps} props - The properties for the component.
 * @returns {React.ReactElement} A trigger element that reveals a detailed tooltip on hover.
 */
const ExplanationTooltip: React.FC<ExplanationTooltipProps> = ({
  children,
  title,
  explanation,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // We use a slight delay to prevent flickering when moving the mouse quickly.
  let timeout: NodeJS.Timeout;

  const showTooltip = () => {
    timeout = setTimeout(() => {
      setIsVisible(true);
    }, 200);
  };

  const hideTooltip = () => {
    clearTimeout(timeout);
    setIsVisible(false);
  };

  return (
    <TooltipWrapper onMouseEnter={showTooltip} onMouseLeave={hideTooltip}>
      {children}
      <TooltipBox isVisible={isVisible} position={position}>
        <h3>{title}</h3>
        <div>{explanation}</div>
      </TooltipBox>
    </TooltipWrapper>
  );
};

export default ExplanationTooltip;