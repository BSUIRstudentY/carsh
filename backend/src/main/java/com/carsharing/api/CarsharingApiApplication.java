package com.carsharing.api;

import com.carsharing.api.config.JwtProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.security.servlet.UserDetailsServiceAutoConfiguration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication(exclude = UserDetailsServiceAutoConfiguration.class)
@EnableConfigurationProperties(JwtProperties.class)
public class CarsharingApiApplication {

    public static void main(String[] args) {
        SpringApplication.run(CarsharingApiApplication.class, args);
    }
}
