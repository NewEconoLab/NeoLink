import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'

import Neon from '@cityofzion/neon-js'

import { Button } from 'rmwc/Button'
import '@material/button/dist/mdc.button.min.css'

import withLoginCheck from '../../components/Login/withLoginCheck'

import style from './Home.css'

import * as AccountActions from '../../actions/account'

@connect(
  state => ({
    account: state.account,
  }),
  dispatch => ({
    actions: bindActionCreators(AccountActions, dispatch),
  })
)

class Home extends Component {
  handleClick = (e) => {
    const { actions } = this.props
    e.preventDefault()
    actions.setAccount('', '')
  }

  render() {
    const { account } = this.props
    var addr = account.address
    var pubkey = 'Private key protected by hardware wallet'
    if (account.wif != '')
    {
      var myAccount = Neon.create.account(account.wif)
      pubkey = myAccount.getPublicKey(true)
    }
    
    return (
      <div>
        <Button ripple raised onClick={ this.handleClick }>
          Logout
        </Button>
        <div className={ style.accountInfoContainer }>
          <div className={ style.accountInfo }><span className={ style.breakWord }>Address: {addr}</span></div>
          <div className={ style.accountInfo } style={ { marginTop: '10px' } }><span className={ style.breakWord }>Public key encoded:<br/> {pubkey}</span></div>
        </div>
      </div>
    )
  }
}

export default withLoginCheck(Home)

Home.propTypes = {
  account: PropTypes.object,
  actions: PropTypes.object,
}
