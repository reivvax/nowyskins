const getTrade = "SELECT * FROM trades WHERE trade_id = $1;";
const getTradesFromUser = "SELECT * FROM trades WHERE seller_id = $1 OR buyer_id = $1;";
const getBuyingTradesFromUser = "SELECT * FROM trades WHERE buyer_id = $1;";
const getSellingTradesFromUser = "SELECT * FROM trades WHERE seller_id = $1;";

const getTradeWithUsersAndItem = `
    SELECT 
        t.trade_id,
        t.seller_id,
        s.display_name AS seller_display_name,
        s.tradelink AS seller_tradelink,
        t.buyer_id,
        b.display_name AS buyer_display_name,
        b.tradelink AS buyer_tradelink,
        t.asset_id,
        t.state,
        t.created_at,
        li.name AS item_name,
        li.price AS item_price,
        li.icon_url AS item_icon_url,
        li.inspect_url AS item_inspect_url
    FROM 
        trades t
    JOIN 
        listed_items li ON t.asset_id = li.asset_id
    JOIN 
        users s ON t.seller_id = s.steam_id
    JOIN 
        users b ON t.buyer_id = b.steam_id
    WHERE 
        t.trade_id = $1;
`;

const getTradesFromUserWithUserAndItem = `
    SELECT 
        t.trade_id,
        t.seller_id,
        CASE 
            WHEN t.seller_id = $1 THEN $2 -- display_name
            ELSE s.display_name
        END AS seller_display_name,
        
        CASE 
            WHEN t.seller_id = $1 THEN $3  -- avatar
            ELSE s.avatar
        END AS seller_avatar,

        CASE 
            WHEN t.seller_id = $1 THEN $4  -- tradelink
            ELSE s.tradelink
        END AS seller_tradelink,

        t.buyer_id,
        
        CASE 
            WHEN t.buyer_id = $1 THEN $2  -- display_name
            ELSE b.display_name
        END AS buyer_display_name,
        
        CASE 
            WHEN t.buyer_id = $1 THEN $3  -- avatar
            ELSE b.avatar
        END AS buyer_avatar,
        
        CASE 
            WHEN t.buyer_id = $1 THEN $4  -- tradelink
            ELSE b.tradelink
        END AS buyer_tradelink,
        
        t.asset_id,
        t.state,
        t.created_at,
        li.name AS item_name,
        li.exterior AS item_exterior,
        li.quality AS item_quality,
        li.rarity AS item_rarity,
        li.paint_wear AS item_paint_wear,
        li.paint_seed AS item_paint_seed,
        li.price AS item_price,
        li.icon_url AS item_icon_url,
        li.inspect_url AS item_inspect_url
    FROM 
        trades t
    JOIN 
        listed_items li ON t.asset_id = li.asset_id
    JOIN 
        users s ON t.seller_id = s.steam_id
    JOIN 
        users b ON t.buyer_id = b.steam_id
    WHERE 
        t.seller_id = $1 OR t.buyer_id = $1
    ORDER BY t.created_at DESC;
`;

const addNewTrade = "INSERT INTO trades (seller_id, buyer_id, asset_id) VALUES ($1, $2, $3) RETURNING *;";
const updateState = "UPDATE trades SET state = $2 WHERE trade_id = $1 RETURNING *;";


module.exports = {
    getTrade,
    getTradesFromUser,
    getBuyingTradesFromUser,
    getSellingTradesFromUser,
    getTradeWithUsersAndItem,
    getTradesFromUserWithUserAndItem,
    addNewTrade,
    updateState,
}