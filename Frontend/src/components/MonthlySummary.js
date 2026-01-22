import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';


ChartJS.register(ArcElement, Tooltip, Legend);

const MonthlySummary = ({ summaryData }) => {

  // Use provided summaryData or default placeholder
  const data = summaryData || {
    institutions: 10,
    students: 500,
    teachers: 50,
    guardians: 450,
    buses: 20,
  };

  // Data for the doughnut chart
  const chartData = {
    labels: ['Students', 'Teachers', 'Guardians'],
    datasets: [
      {
        data: [data.students, data.teachers, data.guardians],
        backgroundColor: [
          'rgba(54, 162, 235, 0.6)', // Blue for Students
          'rgba(255, 193, 7, 0.6)',  // Yellow for Teachers
          'rgba(25, 135, 84, 0.6)',   // Green for Guardians
        ],

        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(255, 193, 7, 1)',
          'rgba(25, 135, 84, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#212529',
        },

      },
      tooltip: {
        callbacks: {
          label: function (context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(2);
            return `${label}: ${value} (${percentage}%)`;
          },
        },
      },
    },
  };

  return (
    <Container className="mt-5">
      <Row>
        <Col>
          <Card>
            <Card.Header
              className="card-header-custom"
              style={{
                backgroundColor: '#fff',
                borderBottom: '1px solid #dee2e6',
                color: '#212529',
              }}
            >

              <h3 className="mb-0">Monthly Summary</h3>
            </Card.Header>
            <Card.Body>
              {/* Summary Cards */}
              <Row className="mb-4">
                <Col md={4} className="mb-3">
                  <Card
                    style={{
                      backgroundColor: '#fff',
                      color: '#212529',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    <Card.Body className="text-center">
                      <h5>Total No. of Institutions</h5>
                      <h2>{data.institutions}</h2>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card
                    style={{
                      backgroundColor: '#fff',
                      color: '#212529',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    <Card.Body className="text-center">
                      <h5>Total No. of Students</h5>
                      <h2>{data.students}</h2>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={4} className="mb-3">
                  <Card
                    style={{
                      backgroundColor: '#fff',
                      color: '#212529',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    <Card.Body className="text-center">
                      <h5>Total No. of Teachers</h5>
                      <h2>{data.teachers}</h2>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-3">
                  <Card
                    style={{
                      backgroundColor: '#fff',
                      color: '#212529',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    <Card.Body className="text-center">
                      <h5>Total No. of Guardians</h5>
                      <h2>{data.guardians}</h2>
                    </Card.Body>
                  </Card>
                </Col>

                <Col md={6} className="mb-3">
                  <Card
                    style={{
                      backgroundColor: '#fff',
                      color: '#212529',
                      border: '1px solid #dee2e6',
                    }}
                  >
                    <Card.Body className="text-center">
                      <h5>Total No. of Buses</h5>
                      <h2>{data.buses}</h2>
                    </Card.Body>
                  </Card>
                </Col>

              </Row>

              {/* Doughnut Chart */}
              <Row>
                <Col>
                  <Card
                    style={{
                      backgroundColor: '#fff',
                      color: '#212529',
                      border: '1px solid #dee2e6',
                    }}
                  >

                    <Card.Header>
                      <h5 className="mb-0">User Role Distribution</h5>
                    </Card.Header>
                    <Card.Body>
                      <div className="d-flex justify-content-center align-items-center">
                        <Doughnut data={chartData}  options={chartOptions} width={500} height={500} />
                      </div>
                    </Card.Body>
                  </Card>
                </Col>
              </Row>
            </Card.Body>
          </Card>s
        </Col>
      </Row>
    </Container>
  );
};

export default MonthlySummary;
