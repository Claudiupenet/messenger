import React from 'react';
import {Row} from 'reactstrap';
import Friends from './messenger/Friends';
import Conversation from './messenger/Conversation';
import MobileMenu from './messenger/MobileMenu';
import axios from 'axios';
class Messenger extends React.Component {

    constructor(props) {
        super(props)
        this.state = {
            token: null,
            conversations: [],
            friends_suggestions: [],
            current_conversation: null,
            message: '',
            search_friends_suggestions: '',
            mobileView: null
        }
    }

    componentDidMount() {
        const mobile = ((typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1));

        const token = localStorage.getItem('token');
        if (mobile) {
            this.setState({token, mobileView: 'friends'})
        } else {
            this.setState({token})
        }
        this.get_conversation_list();
        this.get_friends_suggestions();
        setInterval(this.check_activity, 1000);
        // setInterval(this.get_conversation_list, 5000);
        // setInterval(() => {
        //     if(this.state.current_conversation) {
        //         this.set_current_conversation(this.state.current_conversation._id)
        //     }
        // }, 5000);
        // setInterval(this.get_friends_suggestions, 10000);
    }

    updateData = (e) => {
        this.setState({
            [e.target.name]: e.target.value
        })
    }

    go_to_last_message = () => {
        var lastMessage = document.getElementById("dummy");
        if(lastMessage) {
            lastMessage.scrollIntoView()
        }
    }

    send_friend_request = (id) => {
        axios.post('/user/send_friend_request', {"friend_id": id}, {headers: {token: this.state.token}})
        .then(res => {
            if(res.status === 200) {
                this.handle_remove_suggestion(id);
                this.get_conversation_list();
            }
        })
        .catch(error => {
            console.log("Error at sending friend request " + error)
        })
    }

    confirm_request = (id, answer) => {
        if((answer === false) && this.state.current_conversation && (this.state.current_conversation.friend._id === id)) {
            this.setState({current_conversation: null})
        }
        axios.post('/user/confirm_friend_request', {'friend_id': id, 'answer': answer}, {headers: {token: this.state.token}})
        .then(res => {
            this.get_conversation_list();
            this.get_friends_suggestions();
        })
        .catch(error => {
            console.log("Error at confirming/removing friend request " + error)
        })
    }

    get_conversation_list = () => {
        axios.get('/user/get_conversations_list', {headers: {token: this.state.token || localStorage.getItem('token')}})
        .then(res => {
            if(res.data) {
                 this.setState({conversations: res.data.conversations})
            }
        })
        .catch(error => {
            console.log("Error at getting conversations " + error)
        })
    }

    get_friends_suggestions = () => {
        axios.get('/user/get_friends_suggestions/?search_word=' + this.state.search_friends_suggestions, {headers: {token: this.state.token || localStorage.getItem('token')}})
        .then( res => {
            if(res.data) {
                this.setState({friends_suggestions: res.data.friends_suggestions})
            }
        })
        .catch( error => {
            console.log("Error ar getting friends suggestions " + error)
        })
    }

    handle_remove_suggestion = (id) => {
        this.setState( prevState => ({
            friends_suggestions: prevState.friends_suggestions.filter(suggestion => suggestion._id !== id)
        }))
    }

    set_current_conversation = (id) => {
        axios.get('/user/conversations/get_conversation', {headers: {token: this.state.token, conversation_id: id}})
        .then(res => {
            if(res.data && res.status === 200) {
                 this.oldMessages = [];
                 this.changeMobileView('conversation');
                if(this.state.current_conversation === null) {
                    this.setState({current_conversation: res.data.conversation},() => {this.go_to_last_message()})
                } else {
                    this.oldMessages = [...this.state.current_conversation.messages];
                    if(this.oldMessages.length < res.data.conversation.messages.length) {
                        this.setState({current_conversation: res.data.conversation}, () => {this.go_to_last_message()})
                    } else {
                        this.setState({current_conversation: res.data.conversation})
                    }

                }
            }
        })
        .catch(error => {
            console.log("Error at retrieving current conversation " + error)
        })

        axios.post('/user/conversations/send_seen_event', {}, {headers: {token: this.state.token, conversation_id: id}})
        .then(res => {
            if(res.status === 200) {
                var conversations = [...this.state.conversations]
                var conversation = conversations.find(conversation => conversation.conversation._id === id);
                if(conversation) {
                    if(conversation.conversation.unseen === this.props.appData.user._id) {
                        conversation.conversation.unseen = null;
                        this.setState({conversations})
                    }
                }
            } 
        })
        .catch(error => {
            console.log("Error at sending seen event " + error)
        })
    }

    send_message = (e) => {
        e.preventDefault()
        if(this.state.message < 1 || this.state.message > 500) {
            alert('Message must be at least 1 character long and at most 500')
            return;
        } else {
            axios.post('/user/conversations/add_message', {"message": this.state.message}, {headers: {token: this.state.token, "conversation_id": this.state.current_conversation._id}})
            .then(res => {
                if(res.status === 200) {
                    this.set_current_conversation(this.state.current_conversation._id)
                    this.setState({message: ''})
                    document.getElementById('input-message').focus();
                    this.go_to_last_message();
                }
            })
            .catch(error => {
                console.log("Error at adding new message " + error)
            })
        }
    }

    check_activity = () => {
        axios.get('/user/check_activity', {headers: {token: this.state.token}})
        .then(res => {
            if(res.status === 204) {
                return;
            } else {
                res.data.newActivity.map(activity => {
                    if(activity.kind === 'message') {
                        var conversation = this.state.conversations.find(conversation => conversation.conversation._id === activity.conversation)
                        conversation.conversation.last_message = activity.message;
                        if(this.state.current_conversation && this.state.current_conversation._id === activity.conversation) {
                            var messages = this.state.current_conversation.messages;
                            messages.push(activity.message)
                            this.setState(prev => ({
                                conversations: [conversation, ...prev.conversations.filter(conv => conv.conversation._id !== conversation.conversation._id)],
                                current_conversation : {...prev.current_conversation, messages: messages}
                            }))
                        } else {
                            this.setState(prev => ({
                                conversations: [conversation, ...prev.conversations.filter(conv => conv.conversation._id !== conversation.conversation._id)]
                            }))
                        }
                    }
                    return activity;
                })
                
            }
        })
        .catch(error => {
            if(error) {
                console.log("Error when checking for new activity " + error)
            }
        })
    }

    changeMobileView = (view) => {
        if (this.state.mobileView === null) return;
        this.setState({mobileView: view})
    }

    render() {
        return(
            <Row className="h-100 w-100 m-0">
               <Friends conversations={this.state.conversations}
                    mobileView={this.state.mobileView}
                    friends_suggestions={this.state.friends_suggestions} 
                    send_request={this.send_friend_request} 
                    confirm_request={this.confirm_request}
                    remove_suggestion={this.handle_remove_suggestion}
                    set_conversation={this.set_current_conversation}
                    search_suggestions={(search_word) => this.setState({search_friends_suggestions: search_word})}
                />
                <Conversation conversation={this.state.current_conversation}
                    mobileView={this.state.mobileView}
                    updateData={this.updateData} 
                    send_message={this.send_message}
                    close_conversation={() => this.setState({current_conversation: null})}
                    message={this.state.message}
                />
                <MobileMenu toggle_profile_modal={this.props.toggle_profile_modal} changeView={this.changeMobileView} />
            </Row>
        );
    }
}

export default Messenger;