import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Field, reduxForm } from 'redux-form'

import { api, wallet } from '@cityofzion/neon-js'
import { Button } from 'rmwc/Button'
import { TextField } from 'rmwc/TextField'
import { Select } from 'rmwc/Select'
import '@material/button/dist/mdc.button.min.css'
import '@material/textfield/dist/mdc.textfield.min.css'
import '@material/select/dist/mdc.select.min.css'

import { toNumber, toBigNumber } from '../../utils/math'

import axios from 'axios'

export class Send extends Component {
  state = {
    errorMsg: '',
    loading: false,
    txid: '',
  }

  _renderTextField = ({
    input,
    ...rest
  }) => (
    <TextField
      { ...input }
      { ...rest }
      onChange={ (event) => input.onChange(event.target.value) }
    />
  )

  _renderSelectField = ({
    input,
    ...rest
  }) => (
    <Select
      { ...input }
      { ...rest }
      onChange={ (event) => input.onChange(event.target.value) }
    />
  )

  resetState = () => {
    this.setState({
      errorMsg: '',
      loading: false,
      txid: '',
      assetType: 1,
      address: '',
      amount: '',
    })
  }

  validateAddress = (address) => {
    if (!address) {
      return 'Address field is required'
    }

    try {
      if (wallet.isAddress(address) !== true || address.charAt(0) !== 'A') {
        return 'The address you entered was not valid.'
      }
    } catch (e) {
      return 'The address you entered was not valid.'
    }
  }

  validateAmount = (amount, assetType) => {
    if (!amount) {
      return 'Amount field is required'
    }

    try {
      if (toBigNumber(amount).lte(0)) { // check for negative/zero asset
        return 'You cannot send zero or negative amounts of an asset.'
      }
    } catch (e) {
      return 'You must enter a valid number.'
    }

    if (assetType === 'NEO' && !toBigNumber(amount).isInteger()) { // check for fractional NEO
      return 'You cannot send fractional amounts of NEO.'
    }
  }

  handleSubmit = (values, dispatch, formProps) => {
    const { reset } = formProps
    const { selectedNetworkId, networks, account } = this.props
    const { assetType, address, amount } = values

    this.setState({
      loading: true,
      errorMsg: '',
      txid: '',
    })

    const errorMessages = []
    const addressErrorMessage = this.validateAddress(address)
    if (addressErrorMessage) {
      errorMessages.push(addressErrorMessage)
    }

    const amountErrorMessage = this.validateAmount(amount, assetType)
    if (amountErrorMessage) {
      errorMessages.push(amountErrorMessage)
    }

    // Validate Asset Type
    if (assetType !== 'NEO' && assetType !== 'GAS') {
      errorMessages.push('Asset Type invalid.')
    }

    if (errorMessages.length > 0) {
      this.setState({
        loading: false,
        errorMsg: errorMessages.join(' '),
      })

      return
    }

    let amounts = {}
    amounts[assetType] = toNumber(amount)
    if(!account.wif){
      var assetID = ''
      if (assetType=='NEO'){
        assetID='0xc56f33fc6ecfcd0c225c4ab356fee59390af8560be0e930faebe74a6daff7c9b'
      }
      else if (assetType == 'GAS')
      {
        assetID='0x602c79718b16e442de58778e148d0b1084e3b2dffd5de6b7b16cee7969282de7'
      }

      axios.post('http://api.nel.group/api/testnet', {
        jsonrpc: '2.0',
        method: 'gettransfertxhex',
        params: [account.address,address,assetID,toNumber(amount)],
        id: '1'
      })
      .then(response => {
        console.log(response)

        var transfertxhex = response.data.result[0].transfertxhex
        axios.get("http://127.0.0.1:50288/_api/sign?data=" + transfertxhex + "&source=" + account.address)
        .then(res =>{
          console.log(res)
          var sign = res.data.signdata.toString().toLowerCase()
          var pubkey = res.data.pubkey.toString().toLowerCase()
          console.log(sign)
          console.log(pubkey)

            axios.post('http://api.nel.group/api/testnet', {
              jsonrpc: '2.0',
              method: 'sendtxplussign',
              params: [transfertxhex,sign,pubkey],
              id: '1'
            })
            .then(r => {
              console.log(r)
              this.setState({
                loading: false,
                txid: r.data.result[0].txid,
              })
              console.log(this.state.txid)
              reset() 
            })
            .catch( e => {
              console.log(e)
              this.setState({
                loading: false,
                errorMsg: e.message,
              })
            })
        })
        .catch( e => {
          console.log(e)
          this.setState({
            loading: false,
            errorMsg: e.message,
          })
        })
      })
      .catch( e => {
        console.log(e)
        this.setState({
          loading: false,
          errorMsg: e.message,
        })
      })
     }
    else
    {
      api.neonDB.doSendAsset(networks[selectedNetworkId].url, address, account.wif, amounts)
      .then((result) => {
        console.log(result)
        this.setState({
          loading: false,
          txid: result.txid,
        })
        reset()
      })
      .catch((e) => {
        console.log(e)
        this.setState({
          loading: false,
          errorMsg: e.message,
        })
      })
    } 
  }

  render() {
    const { txid, loading, errorMsg } = this.state
    const { handleSubmit } = this.props

    return (
      <div>
        <form onSubmit={ handleSubmit(this.handleSubmit) }>
          <Field
            component={ this._renderTextField }
            type='text'
            placeholder='Address'
            name='address'
          />
          <Field
            component={ this._renderTextField }
            type='text'
            placeholder='Amount'
            name='amount'
          />

          <Field label='Asset'
            component={ this._renderSelectField }
            cssOnly
            name='assetType'
            options={ [
              {
                label: 'NEO',
                value: 'NEO',
              },
              {
                label: 'GAS',
                value: 'GAS',
              },
            ] }
          />
          <Button raised ripple>Send</Button>
        </form>
        <br />
        {txid &&
          <div>
            <div>Success!</div>
            <div style={ { wordWrap: 'break-word', wordBreak: 'break-all' } }>
              <div>Transaction ID:</div>
              <div>{txid}</div>
            </div>
          </div>
        }
        {loading &&
          <div>Loading...</div>
        }
        {errorMsg !== '' &&
          <div>ERROR: {errorMsg}</div>
        }
      </div>
    )
  }
}

Send.propTypes = {
  account: PropTypes.object.isRequired,
  selectedNetworkId: PropTypes.string.isRequired,
  networks: PropTypes.object.isRequired,
  handleSubmit: PropTypes.func.isRequired,
  reset: PropTypes.func.isRequired,
}

export default reduxForm({ form: 'send', destroyOnUnmount: false, initialValues: { assetType: 'NEO' } })(Send)
