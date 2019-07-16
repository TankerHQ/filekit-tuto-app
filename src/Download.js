import React from 'react';

class Download extends React.Component {
    constructor(props) {
        super(props);

        this.state = {downloadDone: false}
    }

    async componentDidMount() {
        await this.props.fileKit.download(this.props.fileId);
        this.setState({downloadDone: true})
    }

    render() {
        if (!this.state.downloadDone)
            return (<p>Downloading...</p>);
        return (
            <p>
                Downloading done!
                <button onClick={this.props.doneCb}>Exit</button>
            </p>
        );
    }

}

export default Download;
