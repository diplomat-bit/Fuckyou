
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Tabs, Tab, Button } from 'react-bootstrap';
import { Counterparty } from '../types/moderntreasury';
import { getCounterparty } from '../services/api';

interface CounterpartyDetailsProps {
  counterpartyId?: string;
}

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({ counterpartyId: propCounterpartyId }) => {
  // Mock implementation for view fix
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(true);
      setTimeout(() => {
          setCounterparty({
              id: propCounterpartyId || '123',
              name: 'Mock CP',
              email: 'test@example.com',
              taxpayer_identifier: '12345',
              send_remittance_advice: true,
              live_mode: false,
              created_at: Date.now(),
              updated_at: Date.now(),
              discarded_at: 0,
              metadata: {}
          });
          setLoading(false);
      }, 500);
  }, [propCounterpartyId]);

  if (loading) return <Spinner animation="border" />;
  if (!counterparty) return <Alert variant="danger">Not found</Alert>;

  return (
    <Card>
      <Card.Header>{counterparty.name}</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
            <ListGroup.Item>Email: {counterparty.email}</ListGroup.Item>
            <ListGroup.Item>ID: {counterparty.id}</ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CounterpartyDetails;


// --- CONSOLIDATED FROM: CounterpartyDetails (2).tsx ---

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Tabs, Tab, Button } from 'react-bootstrap';
import { Counterparty } from '../types/moderntreasury';
import { getCounterparty } from '../services/api';

interface CounterpartyDetailsProps {
  counterpartyId?: string;
}

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({ counterpartyId: propCounterpartyId }) => {
  // Mock implementation for view fix
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(true);
      setTimeout(() => {
          setCounterparty({
              id: propCounterpartyId || '123',
              name: 'Mock CP',
              email: 'test@example.com',
              taxpayer_identifier: '12345',
              send_remittance_advice: true,
              live_mode: false,
              created_at: Date.now(),
              updated_at: Date.now(),
              discarded_at: 0,
              metadata: {}
          });
          setLoading(false);
      }, 500);
  }, [propCounterpartyId]);

  if (loading) return <Spinner animation="border" />;
  if (!counterparty) return <Alert variant="danger">Not found</Alert>;

  return (
    <Card>
      <Card.Header>{counterparty.name}</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
            <ListGroup.Item>Email: {counterparty.email}</ListGroup.Item>
            <ListGroup.Item>ID: {counterparty.id}</ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CounterpartyDetails;

// --- CONSOLIDATED FROM: CounterpartyDetails (1).tsx ---


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Tabs, Tab, Button } from 'react-bootstrap';
import { Counterparty } from '../types/moderntreasury';
import { getCounterparty } from '../services/api';

interface CounterpartyDetailsProps {
  counterpartyId?: string;
}

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({ counterpartyId: propCounterpartyId }) => {
  // Mock implementation for view fix
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(true);
      setTimeout(() => {
          setCounterparty({
              id: propCounterpartyId || '123',
              name: 'Mock CP',
              email: 'test@example.com',
              taxpayer_identifier: '12345',
              send_remittance_advice: true,
              live_mode: false,
              created_at: Date.now(),
              updated_at: Date.now(),
              discarded_at: 0,
              metadata: {}
          });
          setLoading(false);
      }, 500);
  }, [propCounterpartyId]);

  if (loading) return <Spinner animation="border" />;
  if (!counterparty) return <Alert variant="danger">Not found</Alert>;

  return (
    <Card>
      <Card.Header>{counterparty.name}</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
            <ListGroup.Item>Email: {counterparty.email}</ListGroup.Item>
            <ListGroup.Item>ID: {counterparty.id}</ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CounterpartyDetails;


// --- CONSOLIDATED FROM: CounterpartyDetails (1)_1.tsx ---


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Tabs, Tab, Button } from 'react-bootstrap';
import { Counterparty } from '../types/moderntreasury';
import { getCounterparty } from '../services/api';

interface CounterpartyDetailsProps {
  counterpartyId?: string;
}

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({ counterpartyId: propCounterpartyId }) => {
  // Mock implementation for view fix
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(true);
      setTimeout(() => {
          setCounterparty({
              id: propCounterpartyId || '123',
              name: 'Mock CP',
              email: 'test@example.com',
              taxpayer_identifier: '12345',
              send_remittance_advice: true,
              live_mode: false,
              created_at: Date.now(),
              updated_at: Date.now(),
              discarded_at: 0,
              metadata: {}
          });
          setLoading(false);
      }, 500);
  }, [propCounterpartyId]);

  if (loading) return <Spinner animation="border" />;
  if (!counterparty) return <Alert variant="danger">Not found</Alert>;

  return (
    <Card>
      <Card.Header>{counterparty.name}</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
            <ListGroup.Item>Email: {counterparty.email}</ListGroup.Item>
            <ListGroup.Item>ID: {counterparty.id}</ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CounterpartyDetails;


// --- CONSOLIDATED FROM: CounterpartyDetails_1.tsx ---


import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Tabs, Tab, Button } from 'react-bootstrap';
import { Counterparty } from '../types/moderntreasury';
import { getCounterparty } from '../services/api';

interface CounterpartyDetailsProps {
  counterpartyId?: string;
}

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({ counterpartyId: propCounterpartyId }) => {
  // Mock implementation for view fix
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(true);
      setTimeout(() => {
          setCounterparty({
              id: propCounterpartyId || '123',
              name: 'Mock CP',
              email: 'test@example.com',
              taxpayer_identifier: '12345',
              send_remittance_advice: true,
              live_mode: false,
              created_at: Date.now(),
              updated_at: Date.now(),
              discarded_at: 0,
              metadata: {}
          });
          setLoading(false);
      }, 500);
  }, [propCounterpartyId]);

  if (loading) return <Spinner animation="border" />;
  if (!counterparty) return <Alert variant="danger">Not found</Alert>;

  return (
    <Card>
      <Card.Header>{counterparty.name}</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
            <ListGroup.Item>Email: {counterparty.email}</ListGroup.Item>
            <ListGroup.Item>ID: {counterparty.id}</ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CounterpartyDetails;


// --- CONSOLIDATED FROM: ./components/CounterpartyDetails (2).tsx ---



// --- CONSOLIDATED FROM: CounterpartyDetails (2)_1.tsx ---

import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Spinner, Alert, ListGroup, Badge, Tabs, Tab, Button } from 'react-bootstrap';
import { Counterparty } from '../types/moderntreasury';
import { getCounterparty } from '../services/api';

interface CounterpartyDetailsProps {
  counterpartyId?: string;
}

const CounterpartyDetails: React.FC<CounterpartyDetailsProps> = ({ counterpartyId: propCounterpartyId }) => {
  // Mock implementation for view fix
  const [counterparty, setCounterparty] = useState<Counterparty | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      setLoading(true);
      setTimeout(() => {
          setCounterparty({
              id: propCounterpartyId || '123',
              name: 'Mock CP',
              email: 'test@example.com',
              taxpayer_identifier: '12345',
              send_remittance_advice: true,
              live_mode: false,
              created_at: Date.now(),
              updated_at: Date.now(),
              discarded_at: 0,
              metadata: {}
          });
          setLoading(false);
      }, 500);
  }, [propCounterpartyId]);

  if (loading) return <Spinner animation="border" />;
  if (!counterparty) return <Alert variant="danger">Not found</Alert>;

  return (
    <Card>
      <Card.Header>{counterparty.name}</Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
            <ListGroup.Item>Email: {counterparty.email}</ListGroup.Item>
            <ListGroup.Item>ID: {counterparty.id}</ListGroup.Item>
        </ListGroup>
      </Card.Body>
    </Card>
  );
};

export default CounterpartyDetails;