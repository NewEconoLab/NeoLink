import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'

import { api } from '@cityofzion/neon-js'
import { Button } from 'rmwc/Button'
import { TextField } from 'rmwc/TextField'
import '@material/button/dist/mdc.button.min.css'
import '@material/textfield/dist/mdc.textfield.min.css'



export default class NeoDun extends Component {
  state = {
    loading: false,
    haveAddress: false,
    errorMsg: '',
    address: '',
  }

  showAddrList = () => {
      //alert('NeoDun');

      this.setState({
        loading: true,
        haveAddress: false,
        errorMsg: '',
        address: '',
      })

      axios.get(`http://api.nel.group/api/testnet?jsonrpc=2.0&method=getblockcount&params=[]&id=1`)
      .then(res => {
        this.setState({
          loading: false,
          haveAddress: true,
          errorMsg: '',
          address: res.data.result[0].blockcount,
        })
      });

      //return 'this is list.'
  }

  render() {
    const { loading, haveAddress, errorMsg,  address } = this.state

    return (
      <div>
        <Button raised ripple onClick={() => this.showAddrList() }>
          List NeoDun Address
        </Button>
        <br /><br />
        {haveAddress === true &&
          <div>
            <div>NeoDun Address: {address}</div>
          </div>
        }
        {loading === true &&
          <div>loading...</div>
        }
        {errorMsg !== '' &&
          <div>ERROR: {errorMsg}</div>
        }
      </div>
    )
  }
}
