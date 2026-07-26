# Forex Signal Bot — Bot specification

**Archetype:** custom

**Voice:** professional and concise — write every user-facing message, button label, error, and empty state in this voice.

Publishes free Forex signals to a public channel and executes automated trades for paid invite-only subscribers via a single owner-controlled master account. Paid users receive private confirmations and can query aggregated P&L, while the owner manages invites and subscription status manually.

> This is the complete contract for the bot. Implement EVERY entry point, flow, feature, integration, and edge case below. The completeness review checks the bot against this document after each build pass.

## Primary audience

- Retail Forex traders seeking free signals
- Vetted paid subscribers requiring automated execution

## Success criteria

- Signals posted to public channel with correct formatting
- Automated trades executed from master account for active paid users
- Invite list managed via owner commands
- Subscription status enforced for feature access
- Critical errors reported to admin chat

## Entry points

Every feature must be reachable from the bot's command/button surface (button-first; only /start and /help are slash commands).

- **/start** (command, actor: user, command: /start) — Open main menu with available actions
- **View Subscription Status** (button, actor: user, callback: subscription:status) — Paid users check their active subscription
- **Request P&L Summary** (button, actor: user, callback: pnl:request) — Paid users get aggregated performance data
- **/add_invite** (command, actor: owner, command: /add_invite) — Add a new paid subscriber to invite list
- **/remove_invite** (command, actor: owner, command: /remove_invite) — Remove a paid subscriber from invite list
- **/mark_paid** (command, actor: owner, command: /mark_paid) — Activate subscription for an invited user
- **/pause_trading** (command, actor: owner, command: /pause_trading) — Temporarily halt automated trade execution
- **Force Close All Positions** (button, actor: owner, callback: trading:force_close) — Close all active trades on master account

## Flows

### Signal Publishing
_Trigger:_ owner or automated strategy input

1. Receive signal data
2. Format with pair, direction, SL/TP, and commentary
3. Post to public channel with execution status tracking

_Data touched:_ Signal

### Automated Trade Execution
_Trigger:_ signal approval for trading

1. Validate user is active paid subscriber
2. Send order to master account via broker API
3. Log trade execution
4. Post public channel update
5. Send private confirmation to paid user

_Data touched:_ Signal, Trade

### Invite Management
_Trigger:_ /add_invite or /remove_invite

1. Verify owner identity
2. Update invite list
3. Notify admin chat of changes

_Data touched:_ InviteList, User

### Subscription Control
_Trigger:_ /mark_paid or /mark_unpaid

1. Verify owner identity
2. Update user's subscription status
3. Enforce feature access restrictions

_Data touched:_ Subscription, User

### User Queries
_Trigger:_ button press or /query

1. Verify paid subscription
2. Retrieve recent trade data
3. Format aggregated P&L and positions
4. Send private response

_Data touched:_ Trade, Subscription

## Data entities

Durable data (must survive a restart) uses the toolkit's persistent store, never in-memory maps.

- **User** _(retention: persistent)_ — Telegram user with role and subscription status
  - fields: telegram_id, username, role, subscription_status
- **Signal** _(retention: persistent)_ — Published trade signal with execution metadata
  - fields: pair, direction, size_recommendation, stop_loss, take_profit, timestamp, strategy_source, executed_status
- **Trade** _(retention: persistent)_ — Execution record from master account
  - fields: ticket_id, pair, side, size, open_time, close_time, pl_amount, status
- **InviteList** _(retention: persistent)_ — Owner-managed list of approved paid users
  - fields: telegram_id, username, invite_date
- **Subscription** _(retention: persistent)_ — Monthly billing status for paid users
  - fields: user_id, start_date, end_date, is_paid

## Integrations

- **Telegram** (required) — Bot API messaging
- **Forex Broker API** (required) — Automated trade execution from master account
Call external APIs against their real contract (correct endpoints, ids, params); credentials from env. Do not fake responses.

## Owner controls

- Add/remove invites by username/ID
- Mark users as paid/unpaid
- Pause/resume automated trading
- Force-close all open positions
- Push manual signals to channel

## Notifications

- Public channel signal posts with execution status
- Private trade confirmation messages to paid users
- Weekly performance summaries (win-rate, net P&L) in public channel
- Immediate error alerts to admin chat for trade failures

## Permissions & privacy

- Restrict trade execution queries to paid subscribers
- Never expose individual user P&L in public channel
- Store invite list and subscription status securely
- Only owner can modify invite list and subscription statuses

## Edge cases

- Master account API credentials expire or become invalid
- User requests trade data during execution window
- Multiple signals trigger simultaneous trades exceeding account limits
- Paid user is removed from invite list mid-subscription

## Required tests

- Verify free users see signals but cannot access trade execution
- Confirm paid users receive private messages about their trades
- Test owner can pause trading and force-close positions
- Validate error notifications reach admin chat for failed executions
- Ensure invite list changes immediately affect feature access

## Assumptions

- Owner will provide valid master account credentials
- Billing is manually enforced via /mark_paid commands
- Public channel updates will include aggregated trade results only
- Broker API supports programmatic order execution and status checks
