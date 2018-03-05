import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import axios from 'axios'

import { api } from '@cityofzion/neon-js'
import { Button } from 'rmwc/Button'
import { TextField } from 'rmwc/TextField'
import '@material/button/dist/mdc.button.min.css'
import '@material/textfield/dist/mdc.textfield.min.css'

import { toBigNumber } from '../../utils/math'

 @connect(
  state => ({
    selectedNetworkId: state.config.selectedNetworkId,
    networks: state.config.networks,
  })
)
 
export default class NeoDun extends Component {
  state = {
    loading: false,
    haveAddress: false,
    errorMsg: '',
    addrs: new Array(),
    NEOs:new Array(),
    GASs:new Array()
  }

  showAddrList = () => {
      //alert('NeoDun');

      this.setState({
        loading: true,
        haveAddress: false,
        errorMsg: '',
        addrs: new Array(),
        NEOs:new Array(),
        GASs:new Array()
      })

      //`http://api.nel.group/api/testnet?jsonrpc=2.0&method=getblockcount&params=[]&id=1`
      axios.get(`http://127.0.0.1:50288/_api/listaddress`)
      .then(res => {
        this.setState({
          loading: false,
          haveAddress: true,
          errorMsg: '',
          addrs: res.data.addresses,
        })
        this.getAddrBalance()
      });

      //return 'this is list.'
  }

  updateAddrBlance = (neos,gass) =>{
    this.setState({
      NEOs: neos,
      GASs: gass,
    })
  }
  getAddrBalance = () => {
    const { networks, selectedNetworkId } = this.props

    var NEOs = new Array(this.state.addrs.length);
    var GASs = new Array(this.state.addrs.length);
    this.state.addrs.map((addr,index) => (
      api.neonDB.getBalance(networks[selectedNetworkId]['url'], addr.address)
      .then((result) => {
        NEOs[index] = toBigNumber(result.assets.NEO.balance).toString()
        GASs[index] = toBigNumber(result.assets.GAS.balance).round(8).toString()
 
        api.neonDB.doSendAsset()

        this.updateAddrBlance(NEOs,GASs);
      })
      .catch((e) => {
        NEOs[index] = '0'
        GASs[index] = '0'

        this.updateAddrBlance(NEOs,GASs);
      })
    ))
  }

  render() {
    const { loading, haveAddress, errorMsg,  addrs, NEOs, GASs } = this.state

    return (
      <div>
        <Button raised ripple onClick={() => this.showAddrList() }>
          List NeoDun Address
        </Button>
        <br /><br />
        {haveAddress === true &&
          <div>
            {this.state.addrs.map((addr,index) => (
              <div key={'div' + index}><hr />Neo Address {index}:<br />{addr.address}<br />[NEO] {NEOs[index]}<br />[GAS] {GASs[index]}<hr /></div>
            ))}
            {/* <div>NeoDun Address: {address[0].address}</div> */}
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

NeoDun.propTypes = {
  selectedNetworkId: PropTypes.string,
  networks: PropTypes.object,
}