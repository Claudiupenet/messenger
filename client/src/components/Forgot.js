import React from 'react';
import {Form, FormGroup, Button, Input, Row, Col, Alert} from 'reactstrap';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Forgot = (props) => {
    const [input, updateInput] = React.useState('');
    const submitForm = (e) => {
        e.preventDefault()
        axios.post('/forgot_password', {email: input})
        .then(res => {
            if(res.status === 200) {
                document.getElementById('submit_reset').innerHTML = '<h3 class="m-5">Please check your email for reset link.</h3>'
            }
        })
        .catch(error => {
            if(error.response.status === 404) {
                props.setAlert("User not found. Wrong email address!")
            } else {
                console.log("Error when sending forgot password request " + error)
            }
        })
    }

    return(
        <Row className="m-0">
            <Col md={{size:4, offset:4}} xs={{size:10, offset:1}}>
                <Form onSubmit={submitForm} id="submit_reset">
                    <Alert color={props.alertType} isOpen={props.alertVisible} toggle={props.dismissAlert}>
                        {props.alertMessage}
                    </Alert>
                    <h3 className="text-center m-5">Forgot Password</h3>
                    <FormGroup>
                        <Input type="email" name="email" id="email" onChange={(e) => updateInput(e.target.value)} required placeholder="Enter your email" minLength="4" maxLength="50" />
                    </FormGroup>
                    <FormGroup>
                        <Button color="dark" size="lg" block >Submit</Button>
                    </FormGroup>
                </Form>
                    <div className="text-center"><Link to="/login" >&larr; Back to Login</Link></div>
            </Col>
        </Row>
    )
}

export default Forgot;