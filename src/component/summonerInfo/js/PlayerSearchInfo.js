import React, {useState} from 'react';
import ItemDisplay from "./ItemDisplay";

const toggleDescription = (setFunc, index) => {
    setFunc(prev => prev.map((value, i) => i === index ? !value : value));
};


const PlayerSearchInfo = ({
                              player,
                              // getItemByKey,
                              getSpellByKey,
                              getMainRuneById,
                              getSubRuneData,
                              itemData,
                              runeData,
                          }) => {
    const [showSpellDescription1, setShowSpellDescription1] = useState(false);
    const [showSpellDescription2, setShowSpellDescription2] = useState(false);

    const [showItemDescriptions, setShowItemDescriptions] = useState([false, false, false, false, false, false]);

    const [isViewMainRuneDesc, setIsViewMainRuneDesc] = useState(false);
    const [isViewSubRuneDesc, setIsViewSubRuneDesc] = useState(false);


    const getItemByKey = (key) => {
        for (const userItem in itemData.data) {
            if (itemData.data.hasOwnProperty(userItem) && itemData.data[userItem]) {
                return itemData.data[key];
            }
        }
        return null
    };

    return (
        <div className="my-game-data">
            <div className={"player-info"}>
                <img
                    src={`https://ddragon.leagueoflegends.com/cdn/14.1.1/img/champion/${player.championName}.png`}
                    alt=""
                />
                {player.summoner1Id && (
                    <div className="summoner-spell-info" style={{position: 'relative'}}>
                        <div
                            className={`spell-description ${showSpellDescription1 ? 'show' : ''}`}>
                            <span>{getSpellByKey(player.summoner1Id.toString()).description}</span>
                        </div>
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/spell/${getSpellByKey(player.summoner1Id.toString()).image.full}`}
                            alt="소환사 주문"
                            className="summoner-spell-image"
                            onMouseEnter={() => setShowSpellDescription1(true)}
                            onMouseLeave={() => setShowSpellDescription1(false)}
                        />
                        <div
                            className={`spell-description1 ${showSpellDescription2 ? 'show' : ''}`}>
                            <span>{getSpellByKey(player.summoner2Id.toString()).description}</span>
                        </div>
                        <img
                            src={`https://ddragon.leagueoflegends.com/cdn/14.2.1/img/spell/${getSpellByKey(player.summoner2Id.toString()).image.full}`}
                            alt="소환사 주문"
                            className="summoner-spell-image"
                            onMouseEnter={() => setShowSpellDescription2(true)}
                            onMouseLeave={() => setShowSpellDescription2(false)}
                        />
                    </div>
                )}
                <div className="rune-parent-container">
                    {player.perks.styles.map((perk, indexPerk) => {
                        if (indexPerk === 0) {
                            return (
                                <div key={indexPerk} className="summoner-rune-info"
                                     onMouseEnter={() => setIsViewMainRuneDesc(true)}
                                     onMouseLeave={() => setIsViewMainRuneDesc(false)}>
                                    <div className={`rune-description ${isViewMainRuneDesc ? 'show' : ''}`}>
                                        <div className="is-view-mainrune-desc-container"
                                             dangerouslySetInnerHTML={{__html: getMainRuneById(perk.selections[0].perk).longDesc}}/>
                                    </div>
                                    <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/img/${getMainRuneById(perk.selections[0].perk).icon}`}
                                        alt={getMainRuneById(perk.selections[0].perk).name}
                                    />
                                </div>
                            );
                        } else if (indexPerk === 1) {
                            return (
                                <div key={indexPerk} className="summoner-rune-info"
                                     onMouseEnter={() => setIsViewSubRuneDesc(true)}
                                     onMouseLeave={() => setIsViewSubRuneDesc(false)}>
                                    <div className={`rune-description ${isViewSubRuneDesc ? 'show' : ''}`}>
                                        <div className="is-view-subrune-desc-container"
                                             dangerouslySetInnerHTML={{__html: getSubRuneData(perk.style).name}}
                                        />
                                    </div>
                                    <img
                                        src={`https://ddragon.leagueoflegends.com/cdn/img/${getSubRuneData(perk.style).icon}`}
                                        alt="c"
                                    />
                                </div>
                            );
                        } else {
                            return null;
                        }
                    })}
                </div>
                <div className="kda-data-container">
                    <span className={"kda-number"}>{player.kills} / {player.deaths} / {player.assists}</span>
                    <span className="kda">KDA {((player.kills + player.assists) / player.deaths).toFixed(1)}</span>
                </div>
            </div>
            <div className="item-slot">
                {
                    [0, 1, 2, 3, 4, 5, 6].map((itemIndex) => (
                        <ItemDisplay
                            key={itemIndex}
                            itemKey={player[`item${itemIndex}`]}
                            itemIndex={itemIndex}
                            toggleDescription={toggleDescription}
                            getItemByKey={getItemByKey}
                            showItemDescriptions={showItemDescriptions}
                            toggleShownDescriptions={setShowItemDescriptions}
                        />
                    ))
                }
            </div>
        </div>
    );
};

export default PlayerSearchInfo;

