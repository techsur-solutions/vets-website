import React from 'react';
import { connect } from 'react-redux';
import classNames from 'classnames';
import { Link } from 'react-router';

import SortableTable from '@department-of-veterans-affairs/formation-react/SortableTable';
import backendServices from 'platform/user/profile/constants/backendServices';
import { selectAvailableServices } from 'platform/user/selectors';
import recordEvent from 'platform/monitoring/record-event';
import { mhvBaseUrl } from 'platform/site-wide/cta-widget/helpers';

import { formattedDate } from '../utils/helpers';
import { fetchInbox } from '../actions/messaging';

function recordDashboardClick(product) {
  return () => {
    recordEvent({
      event: 'dashboard-navigation',
      'dashboard-action': 'view-link',
      'dashboard-product': product,
    });
  };
}

class MessagingWidget extends React.Component {
  componentDidMount() {
    if (this.props.canAccessMessaging) {
      this.props.fetchInbox();
    }
  }

  render() {
    const { recipients, canAccessMessaging, messages = [] } = this.props;
    let content;

    if (!canAccessMessaging || (recipients && recipients.length === 0)) {
      // do not show widget if user is not a VA patient
      // or if user does not have access to messaging
      return null;
    }

    const fields = [
      { label: 'From', value: 'senderName', nonSortable: true },
      { label: 'Subject line', value: 'subject', nonSortable: true },
      { label: '', value: 'hasAttachment', nonSortable: true },
      { label: 'Date', value: 'sentDate', nonSortable: true },
    ];

    // eslint-disable-next-line no-unused-vars
    const makeMessageLink = (linkContent, id) => (
      // Messaging temporarily disabled.
      // See: https://github.com/department-of-veterans-affairs/vets.gov-team/issues/14499
      // <Link href={`/health-care/messaging/inbox/${id}`}>{linkContent}</Link>
      <Link>{linkContent}</Link>
    );

    const unreadMessages = messages.filter(
      message => message.readReceipt !== 'READ',
    );

    const data = unreadMessages.map(message => {
      const id = message.messageId;
      const rowClass = classNames({
        'messaging-message-row': true,
      });

      const attachmentIcon = message.attachment ? (
        <i className="fa fa-paperclip" aria-label="Message has an attachment" />
      ) : null;

      return {
        id,
        rowClass,
        hasAttachment: attachmentIcon,
        recipientName: makeMessageLink(message.recipientName, id),
        senderName: makeMessageLink(message.senderName, id),
        subject: makeMessageLink(message.subject, id),
        sentDate: makeMessageLink(formattedDate(message.sentDate), id),
      };
    });

    if (unreadMessages && unreadMessages.length > 0) {
      content = (
        <SortableTable
          className="usa-table-borderless va-table-list msg-table-list"
          data={data}
          currentSort={this.props.sort}
          fields={fields}
        />
      );
    } else {
      content = (
        <p>You don’t have any unread messages from your health care team.</p>
      );
    }

    return (
      <div id="msg-widget">
        <h2>Check Secure Messages</h2>
        {content}
        <p>
          <a
            onClick={recordDashboardClick('view-all-messages')}
            href={`${mhvBaseUrl()}/mhv-portal-web/secure-messaging`}
            target="_blank"
            rel="noopener"
          >
            View all your secure messages
          </a>
        </p>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const msgState = state.health.msg;
  const folder = msgState.folders.data.currentItem;
  const canAccessMessaging = selectAvailableServices(state).includes(
    backendServices.MESSAGING,
  );

  const { messages, sort } = folder;

  return {
    loading: msgState.loading,
    messages,
    recipients: msgState.recipients.data,
    sort,
    canAccessMessaging,
  };
};

const mapDispatchToProps = {
  fetchInbox,
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(MessagingWidget);
export { MessagingWidget };
