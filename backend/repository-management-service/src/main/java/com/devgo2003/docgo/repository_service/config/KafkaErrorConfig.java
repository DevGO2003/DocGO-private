package com.devgo2003.docgo.repository_service.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.annotation.KafkaListenerConfigurer;
import org.springframework.kafka.config.KafkaListenerEndpointRegistrar;
import org.springframework.kafka.listener.ConsumerAwareListenerErrorHandler;
import org.springframework.kafka.listener.ListenerExecutionFailedException;
import org.springframework.messaging.Message;
import org.apache.kafka.clients.consumer.Consumer;

@Configuration
@Slf4j
public class KafkaErrorConfig implements KafkaListenerConfigurer {

    @Override
    public void configureKafkaListeners(KafkaListenerEndpointRegistrar registrar) {
        log.info("===== Configuring Kafka Listeners =====");
    }

    @Bean
    public ConsumerAwareListenerErrorHandler kafkaErrorHandler() {
        return new ConsumerAwareListenerErrorHandler() {
            @Override
            public Object handleError(Message<?> message, ListenerExecutionFailedException e,
                                     Consumer<?, ?> consumer) {
                log.error("===== KAFKA ERROR HANDLER =====");
                log.error("Message: {}", message);
                log.error("Error: {}", e.getMessage());
                log.error("Payload: {}", message.getPayload());
                log.error("Headers: {}", message.getHeaders());
                log.error("Full exception:", e);
                
                // Log consumer info
                if (consumer != null) {
                    log.error("Consumer group: {}", consumer.groupMetadata());
                    log.error("Consumer assignment: {}", consumer.assignment());
                }
                
                // Rethrow to maintain default behavior
                throw e;
            }
        };
    }
}
