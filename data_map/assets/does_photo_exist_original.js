function doesPhotoIDExist(id)
{
    var photo_id_list = [
    // put all the ID's of data points that has photos
    	1491775230,
        1491783997,
        1491789020,
        1491788722,
        1491688452,
        1491865590,
        1491856632,
        1491769851,
        1491770245,
        1491863880,
        1491854592,
        1491853204,
        1491852947,
        1491768724,
    ];

    for (var i = 0; i < photo_id_list.length; i ++)
    {
    	if (id == photo_id_list[i])
    	{
    		return true;
    	}
    }
    return false;
}