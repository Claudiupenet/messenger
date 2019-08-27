import React from 'react';
import { Form, Row, Col, Alert } from 'reactstrap';

const formWrapper = props => {
    return (
      <Row style={{margin: "auto"}}>
        <Col md={{size: 6, offset: 3}} xs={{size: 10, offset: 1}}>
          <Form onSubmit={ window.location.pathname === '/login' ? (e) => props.tryLogin(e, props.history) : (e) => props.tryRegister(e, props.history)}>
          <Alert color={props.alertType} isOpen={props.alertVisible} toggle={props.dismissAlert}>
            {props.alertMessage}
          </Alert>
          {props.children}
          </Form>
        </Col>
      </Row>
    );
}

export default formWrapper;