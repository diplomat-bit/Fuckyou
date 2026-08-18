import React from 'react';
import Card from '../../Card';

const CiCdView: React.FC = () => {
    return (
        <Card title="CI/CD Pipelines">
            <p className="text-gray-400">A view for monitoring the status of all continuous integration and deployment pipelines across the organization.</p>
        </Card>
    );
};

export default CiCdView;
