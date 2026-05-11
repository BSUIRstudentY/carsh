package com.carsharing.api.config;

import org.apache.kafka.clients.admin.NewTopic;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.kafka.config.TopicBuilder;

@Configuration
public class KafkaTopicConfig {

    @Bean
    public NewTopic vehicleTelemetryTopic() {
        return TopicBuilder.name("vehicle-telemetry")
                .partitions(6)
                .replicas(1)
                .build();
    }

    @Bean
    public NewTopic vehicleTelemetryDlqTopic() {
        return TopicBuilder.name("vehicle-telemetry-dlq")
                .partitions(1)
                .replicas(1)
                .build();
    }
}
