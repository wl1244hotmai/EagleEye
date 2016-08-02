/**
 * The Max number of data need to be display,
 * each point represent data per minute,
 * e.g. maxItemNum=120 means only display last 2 hours' data.
 */ 
var maxItemNum = 120;
var dataFilePathPrefix = "./data/"
var timeStampFilePath = "./data/te_synchronization_timestamp";
//var timeStampFilePath = "./fileList/te_synchronization_timestamp";

/**
 *  The JSONArray to store each test's configuratoin.
 */
var itemList = [
	{
		"id" : "ue_no",
		"name" : "Cell UE",
		"div" : "ue_no_div",
		"title" : "ALU LTE Cell Cluster UE Monitoring",
		"yLabel" : "Active UE",
		"fileSrc" : "./data/cluster_ue_list",
		//"fileSrc" : "./fileList/cluster_ue_list",
		"suffix": "_ue"
	},
	{
		"id" : "ue_iot",
		"name" : "Cell IOT",
		"div" : "ue_iot_div",
		"title" : "ALU eNB Cluster IOT Monitoring",
		"yLabel" : "IOT (0.1db)",
		"fileSrc" : "./data/cluster_iot_list",
		//"fileSrc" : "./fileList/cluster_iot_list",
		"suffix" : "_iot"
	},
	{
		"id" : "cpu_load",
		"name" : "CPU Load",
		"div" : "cpu_load_div",
		"title" : "ALU eNB Cluster CPU Load Monitoring",
		"yLabel" : "    CPU Idle (eCCM)",
		"fileSrc" : "./data/cluster_eccm_cpu_list",
		//"fileSrc" : "./fileList/cluster_eccm_cpu_list",
		"suffix" : "_cpuload"
	},
	{
		"id" : "total_ue",
		"name" : "Total UE",
		"div" : "total_ue_div",
		"title" : "ALU LTE Cell Cluster UE Monitoring",
		"yLabel" : "All Cell UE",
		"fileSrc" : "./data/cluster_total_ue_list",
		//"fileSrc" : "./fileList/cluster_total_ue_list",
		"suffix" : "_uealute"
	},
	{
		"id" : "dl_tp",
		"name" : "DL Throughput",
		"div" : "dl_tp_div",
		"title" : "ALU eNB Cluster Throughout Monitoring",
		"yLabel" : "                          eNB DL Throughput (Mbps)",
		"fileSrc" : "./data/cluster_dlthroughput_list",
		//"fileSrc" : "./fileList/cluster_dlthroughput_list",
		"suffix" : "_dlthroughput"
	},
	{
		"id" : "ul_tp",
		"name" : "UL Throughput",
		"div" : "ul_tp_div",
		"title" : "ALU eNB Cluster Throughout Monitoring",
		"yLabel" : "                          eNB UL Throughput (Kbps)",
		"fileSrc" : "./data/cluster_ulthroughput_list",
		//"fileSrc" : "./fileList/cluster_ulthroughput_list",
		"suffix" : "_ulthroughput"
	},
];
