# InvestmentsView Component

## Overview

The `InvestmentsView` component is the primary user-facing interface for displaying a user's investment portfolio. It provides a comprehensive summary of their holdings, performance metrics, and asset allocation. This component is designed to be modular and fetch data efficiently to provide a responsive user experience.

*Note: This documentation replaces a previous philosophical manifesto. The goal of this refactoring is to provide clear, actionable technical documentation for developers, in line with the project's move toward a stable, production-ready application.*

## Responsibilities

-   Fetches and displays the user's investment portfolio data.
-   Renders a summary of key metrics like total value, daily change, and overall return.
-   Displays a detailed list of individual holdings in a table format.
-   Visualizes asset allocation and performance over time using charts.
-   Handles loading and error states gracefully.

## Props

| Prop         | Type                | Description                                         | Required |
|--------------|---------------------|-----------------------------------------------------|----------|
| `userId`     | `string`            | The unique identifier for the user whose investments are being displayed. | Yes      |

## State Management

This component utilizes `@tanstack/react-query` for server-state management.

-   **Data Fetching**: The `useQuery` hook fetches portfolio data from the `/api/v1/investments/{userId}` endpoint.
-   **Caching**: React Query handles caching, refetching on window focus, and background data synchronization to ensure the data is up-to-date.
-   **Error Handling**: The component uses the `isError` and `error` properties from the `useQuery` result to display appropriate error messages to the user if the data fails to load.
-   **Loading State**: The `isLoading` flag is used to show a loading skeleton or spinner while the initial data is being fetched.

## Components Used

-   `InvestmentSummary`: Displays high-level portfolio metrics.
-   `HoldingsTable`: A table component to list individual assets, their quantity, value, and performance.
-   `AllocationChart`: A pie or donut chart visualizing the asset allocation by category.
-   `PerformanceChart`: A line chart showing the portfolio's value over a selected time period.
-   `LoadingSpinner`: A component to indicate that data is being loaded.
-   `ErrorMessage`: A component to display an error message if the API call fails.

## Usage Example


import React from 'react';
import { InvestmentsView } from './InvestmentsView';

const UserDashboard = ({ currentUserId }) => {
  return (
    <div>
      <h1>My Portfolio</h1>
      <InvestmentsView userId={currentUserId} />
    </div>
  );
};

export default UserDashboard;


## Future Enhancements

-   Integration with a real-time data provider for live price updates.
-   Allowing users to customize the time range for the performance chart.
-   Adding transaction history and dividend tracking.