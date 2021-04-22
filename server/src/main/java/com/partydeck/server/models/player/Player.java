package com.partydeck.server.models.player;

import com.partydeck.server.models.shared.BroadcastContext;
import com.partydeck.server.models.shared.Card;
import com.partydeck.server.models.shared.Identifiable;

/**
 * A class representing a player object
 * @author Itay Schechner
 * @version 1.0
 */
public abstract class Player implements Identifiable<String> {

    public static final int NUMBER_OF_CARDS = 4;

    // attributes
    private String id;

    private String nickname;

    private boolean admin;

    private boolean judge;

    private PlayerEventListener eventListener;

    private int roundsWon;

    private final Card[] currentCards;

    /**
     * Empty constructor. Sets everything up.
     */
    public Player() {
        this.id = "";
        this.nickname = "Anonymous";
        this.admin = false;
        this.judge = false;
        this.eventListener = null;
        this.roundsWon = 0;
        this.currentCards = new Card[NUMBER_OF_CARDS];
    }

    /**
     * Creates a new player object
     * @param id the id of the player
     * @param nickname the nickname of the player
     * @param initialCards the initial cards given to the player
     */
    public Player(String id, String nickname, Card[] initialCards) {
        this();
        this.id = id;
        this.nickname = nickname;

        System.arraycopy(initialCards, 0, currentCards, 0, NUMBER_OF_CARDS);
    }

    /**
     * Returns the id of the object
     * @return the object id
     */
    @Override
    public String getId() {
        return id;
    }

    /**
     * Returns the nickname of the player
     * @return the player nickname
     */
    public String getNickname() {
        return nickname;
    }

    /**
     * Returns the admin state of the player
     * @return true if player is admin
     */
    public boolean isAdmin() {
        return admin;
    }

    /**
     * Returns the judge state of the player
     * @return true if player is the current judge
     */
    public boolean isJudge() {
        return judge;
    }

    /**
     * Returns the number of rounds won by the player
     * @return the number of rounds won.
     */
    public int getRoundsWon() {
        return roundsWon;
    }

    /**
     * Returns a copy of the player cards
     * @return the player cards.
     */
    public Card[] getCurrentCards() {
        Card[] copy = new Card[NUMBER_OF_CARDS];
        System.arraycopy(currentCards, 0, copy, 0, NUMBER_OF_CARDS);
        return copy;
    }

    /**
     * Modify the judge state
     * @param judge the new judge state
     */
    public void setJudge(boolean judge) {
        this.judge = judge;
    }

    /**
     * Modify the player event listener
     * @param eventListener the event listener to set
     */
    public void setPlayerEventListener(PlayerEventListener eventListener) {
        this.eventListener = eventListener;
    }

    /**
     * Change the player admin state to true. Irreversible.
     */
    public void makeAdmin() {
        this.admin = true;
    }

    /**
     * Increment the number of rounds won by the player.
     */
    public void incrementRoundsWon() {
        roundsWon++;
    }

    /**
     * Checks if a given id is identical to the identifiable object id
     * @param id the id to compare to
     * @return true if the two values match
     */
    @Override
    public boolean is(String id) {
        return this.id.equals(id);
    }

    private void handleCardUsage(Card card, int index) {
        if (eventListener == null)
            return;

        Card newCard = eventListener.onCardUse(card, this);
        currentCards[index] = newCard;
    }

    protected void handleCardUsage(String cardId) {
        for (int i = 0; i < NUMBER_OF_CARDS; i++) {
            Card card = currentCards[i];
            if (card.is(cardId))
                handleCardUsage(card, i);
        }
    }

    protected void handleStartRequest() {
        if (eventListener != null && admin)
            eventListener.onStartRequest();
    }

    protected void handleStopRequest() {
        if (eventListener != null && admin)
            eventListener.onStopRequest();
    }

    protected void handleDisconnection() {
        if (eventListener != null)
            eventListener.onPlayerDisconnection(this);
    }

    /**
     * Close the connection implementation
     */
    public abstract void closeConnection();

    /**
     * Broadcast a message
     * @param context the context of the broadcast
     * @param args the args to send.
     */
    public abstract void broadcast(BroadcastContext context, Object[] ...args);

    /**
     * A String representation of the player
     * @return the string holding the player values.
     */
    @Override
    public String toString() {
        return "Player{" +
                "id='" + id + '\'' +
                ", nickname='" + nickname + '\'' +
                ", admin=" + admin +
                ", judge=" + judge +
                ", roundsWon=" + roundsWon +
                '}';
    }
}
