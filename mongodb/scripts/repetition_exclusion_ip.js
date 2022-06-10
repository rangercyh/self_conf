db.getCollection("role").aggregate([
{
    $project: {
        "addr": { $split: ["$misc.last_addr", ":"] }
    }
},
{
    $project: {
        "addr": 1,
        "ip": { $arrayElemAt: ["$addr", 0] }
    }
},
{
    $group: {
        "_id": "$ip"
    }
}
]).itcount()
