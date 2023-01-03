%module medooze_video_codecs
%{
extern "C" {
#include "libavcodec/avcodec.h"
}
void log_ffmpeg(void* ptr, int level, const char* fmt, va_list vl)
{
	static int print_prefix = 1;
	char line[1024];

	if (level > AV_LOG_ERROR)
		return;

	//Format the
	av_log_format_line(ptr, level, fmt, vl, line, sizeof(line), &print_prefix);

	//Remove buffer errors
	//if (strstr(line,"vbv buffer overflow")!=NULL)
		//exit
	//	return;
	//Log
	Log(line);
}

int lock_ffmpeg(void **param, enum AVLockOp op)
{
	//Get mutex pointer
	pthread_mutex_t* mutex = (pthread_mutex_t*)(*param);
	//Depending on the operation
	switch(op)
	 {
		case AV_LOCK_CREATE:
			//Create mutex
			mutex = (pthread_mutex_t*)malloc(sizeof(pthread_mutex_t));
			//Init it
			pthread_mutex_init(mutex,NULL);
			//Store it
			*param = mutex;
			break;
		case AV_LOCK_OBTAIN:
			//Lock
			pthread_mutex_lock(mutex);
			break;
		case AV_LOCK_RELEASE:
			//Unlock
			pthread_mutex_unlock(mutex);
			break;
		case AV_LOCK_DESTROY:
			//Destroy mutex
			pthread_mutex_destroy(mutex);
			//Free memory
			free(mutex);
			//Clean
			*param = NULL;
			break;
	}
	return 0;
}

class VideoCodecsModule
{
public:
	typedef std::list<v8::Local<v8::Value>> Arguments;
public:

	~VideoCodecsModule()
	{
		Terminate();
	}
	
	/*
	 * Async
	 *  Enqueus a function to the async queue and signals main thread to execute it
	 */
	static void Async(std::function<void()> func) 
	{
		//Check if not terminatd
		if (uv_is_active((uv_handle_t *)&async))
		{
			//Enqueue
			queue.enqueue(std::move(func));
			//Signal main thread
			uv_async_send(&async);
		}
	}
public:
	static void Initialize()
	{
		//Register mutext for ffmpeg
		av_lockmgr_register(lock_ffmpeg);

		//Set log level
		av_log_set_callback(log_ffmpeg);

		//Init avcodecs
		avcodec_register_all();

		//Init async handler
		uv_async_init(uv_default_loop(), &async, async_cb_handler);
	}

	static void Terminate()
	{
		Log("-VideoCodecsModule::Terminate\n");
		//Close handle
		uv_close((uv_handle_t *)&async, NULL);
		
		std::function<void()> func;
		//Dequeue all pending functions
		while(queue.try_dequeue(func)){}
	}
	
	static void EnableLog(bool flag)
	{
		//Enable log
		Logger::EnableLog(flag);
	}
	
	static void EnableDebug(bool flag)
	{
		//Enable debug
		Logger::EnableDebug(flag);
	}
	
	static void EnableUltraDebug(bool flag)
	{
		//Enable debug
		Logger::EnableUltraDebug(flag);
	}
	
	static void async_cb_handler(uv_async_t *handle)
	{
		std::function<void()> func;
		//Get all pending functions
		while(queue.try_dequeue(func))
		{
			//Execute async function
			func();
		}
	}
	
	
private:
	//http://stackoverflow.com/questions/31207454/v8-multithreaded-function
	static uv_async_t  async;
	static moodycamel::ConcurrentQueue<std::function<void()>> queue;
};

//Static initializaion
uv_async_t VideoCodecsModule::async;
moodycamel::ConcurrentQueue<std::function<void()>>  VideoCodecsModule::queue;


%}


%nodefaultctor VideoCodecsModule;
%nodefaultdtor VideoCodecsModule;
struct VideoCodecsModule
{
	static void Initialize();
	static void Terminate();
	static void EnableLog(bool flag);
	static void EnableDebug(bool flag);
	static void EnableUltraDebug(bool flag);
};
