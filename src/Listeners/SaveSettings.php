<?php

namespace Ltydi\CanBusSettings\Listeners;

use Flarum\Settings\Event\Saved;
use Illuminate\Support\Arr;
use Psr\Log\LoggerInterface;

class SaveSettings
{
    /**
     * @var LoggerInterface
     */
    protected $logger;

    /**
     * @param LoggerInterface $logger
     */
    public function __construct(LoggerInterface $logger)
    {
        $this->logger = $logger;
    }

    /**
     * @param Saved $event
     */
    public function handle(Saved $event)
    {
        // 检查是否有我们的设置
        if (Arr::has($event->settings, 'ltydi-canbus-settings.promptText')) {
            $promptText = $event->settings['ltydi-canbus-settings.promptText'];
            
            // 记录日志
            $this->logger->info('CanBus设置已保存: ' . $promptText);
            
            // 写入日志文件用于调试
            $logfile = __DIR__ . '/../../settings-saved.log';
            file_put_contents(
                $logfile, 
                date('Y-m-d H:i:s') . " - 设置已保存: " . $promptText . "\n", 
                FILE_APPEND
            );
        }
    }
} 