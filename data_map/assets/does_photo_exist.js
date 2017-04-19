function doesPhotoIDExist(id)
{
    var photo_id_list = [
    // put all the ID's of data points that has photos
    	1491775230,
        1491783997,
        1491789020,
        1491788722,
        1491688452,
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