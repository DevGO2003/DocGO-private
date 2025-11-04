#!/usr/bin/env python3
"""
Kafka Performance Test - Chi tiết hơn với Python
Test throughput, latency, và reliability của Kafka
"""

import time
import json
from datetime import datetime
from kafka import KafkaProducer, KafkaConsumer
from kafka.errors import KafkaError
import statistics

# Configuration
KAFKA_BOOTSTRAP_SERVERS = 'localhost:9092'
TEST_TOPIC = 'speed-test-topic'
NUM_MESSAGES = 1000

class KafkaSpeedTest:
    def __init__(self):
        self.producer = None
        self.consumer = None
        
    def setup_producer(self):
        """Khởi tạo Kafka Producer"""
        print("Setting up Kafka Producer...")
        self.producer = KafkaProducer(
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v).encode('utf-8'),
            acks='all',  # Wait for all replicas
            compression_type='gzip',
            max_request_size=1048576,
            buffer_memory=33554432,
            retries=3
        )
        print("✓ Producer ready")
        
    def setup_consumer(self):
        """Khởi tạo Kafka Consumer"""
        print("Setting up Kafka Consumer...")
        self.consumer = KafkaConsumer(
            TEST_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            auto_offset_reset='earliest',
            enable_auto_commit=True,
            group_id='speed-test-group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            consumer_timeout_ms=10000
        )
        print("✓ Consumer ready")
        
    def test_producer_throughput(self, num_messages=NUM_MESSAGES):
        """Test tốc độ gửi message"""
        print(f"\n{'='*50}")
        print(f"PRODUCER THROUGHPUT TEST - {num_messages} messages")
        print(f"{'='*50}")
        
        latencies = []
        failures = 0
        
        start_time = time.time()
        
        for i in range(num_messages):
            message = {
                'id': i,
                'timestamp': datetime.now().isoformat(),
                'data': f'Test message {i}' * 10  # ~150 bytes
            }
            
            msg_start = time.time()
            try:
                future = self.producer.send(TEST_TOPIC, value=message)
                record_metadata = future.get(timeout=10)
                msg_latency = (time.time() - msg_start) * 1000  # ms
                latencies.append(msg_latency)
                
                if (i + 1) % 100 == 0:
                    print(f"Sent {i + 1}/{num_messages} messages...")
                    
            except KafkaError as e:
                failures += 1
                print(f"✗ Error sending message {i}: {e}")
        
        self.producer.flush()
        end_time = time.time()
        
        # Statistics
        duration = end_time - start_time
        throughput = num_messages / duration
        avg_latency = statistics.mean(latencies) if latencies else 0
        p95_latency = statistics.quantiles(latencies, n=20)[18] if len(latencies) > 20 else 0
        p99_latency = statistics.quantiles(latencies, n=100)[98] if len(latencies) > 100 else 0
        
        print(f"\n{'='*50}")
        print("PRODUCER RESULTS:")
        print(f"{'='*50}")
        print(f"Duration:           {duration:.2f} seconds")
        print(f"Messages sent:      {num_messages - failures}")
        print(f"Failures:           {failures}")
        print(f"Throughput:         {throughput:.2f} msg/s")
        print(f"Avg Latency:        {avg_latency:.2f} ms")
        print(f"P95 Latency:        {p95_latency:.2f} ms")
        print(f"P99 Latency:        {p99_latency:.2f} ms")
        print(f"{'='*50}\n")
        
        return {
            'duration': duration,
            'throughput': throughput,
            'avg_latency': avg_latency,
            'failures': failures
        }
    
    def test_consumer_throughput(self, expected_messages=NUM_MESSAGES):
        """Test tốc độ nhận message"""
        print(f"\n{'='*50}")
        print(f"CONSUMER THROUGHPUT TEST")
        print(f"{'='*50}")
        
        messages_received = 0
        start_time = time.time()
        
        try:
            for message in self.consumer:
                messages_received += 1
                
                if messages_received % 100 == 0:
                    print(f"Received {messages_received}/{expected_messages} messages...")
                
                if messages_received >= expected_messages:
                    break
                    
        except Exception as e:
            print(f"Consumer stopped: {e}")
        
        end_time = time.time()
        duration = end_time - start_time
        throughput = messages_received / duration if duration > 0 else 0
        
        print(f"\n{'='*50}")
        print("CONSUMER RESULTS:")
        print(f"{'='*50}")
        print(f"Duration:           {duration:.2f} seconds")
        print(f"Messages received:  {messages_received}")
        print(f"Throughput:         {throughput:.2f} msg/s")
        print(f"{'='*50}\n")
        
        return {
            'duration': duration,
            'throughput': throughput,
            'messages_received': messages_received
        }
    
    def test_end_to_end_latency(self, num_samples=100):
        """Test latency từ producer đến consumer"""
        print(f"\n{'='*50}")
        print(f"END-TO-END LATENCY TEST - {num_samples} samples")
        print(f"{'='*50}")
        
        latencies = []
        
        # Reset consumer to latest
        self.consumer.close()
        self.consumer = KafkaConsumer(
            TEST_TOPIC,
            bootstrap_servers=KAFKA_BOOTSTRAP_SERVERS,
            auto_offset_reset='latest',
            enable_auto_commit=True,
            group_id='latency-test-group',
            value_deserializer=lambda m: json.loads(m.decode('utf-8')),
            consumer_timeout_ms=5000
        )
        
        for i in range(num_samples):
            send_time = time.time()
            message = {
                'id': i,
                'send_timestamp': send_time,
                'data': f'Latency test {i}'
            }
            
            self.producer.send(TEST_TOPIC, value=message)
            self.producer.flush()
            
            # Wait for message
            try:
                for msg in self.consumer:
                    receive_time = time.time()
                    if msg.value['id'] == i:
                        latency = (receive_time - send_time) * 1000
                        latencies.append(latency)
                        print(f"Message {i}: {latency:.2f} ms")
                        break
            except Exception as e:
                print(f"Timeout waiting for message {i}")
        
        if latencies:
            avg_latency = statistics.mean(latencies)
            min_latency = min(latencies)
            max_latency = max(latencies)
            p95_latency = statistics.quantiles(latencies, n=20)[18] if len(latencies) > 20 else 0
            
            print(f"\n{'='*50}")
            print("END-TO-END LATENCY RESULTS:")
            print(f"{'='*50}")
            print(f"Samples:            {len(latencies)}")
            print(f"Avg Latency:        {avg_latency:.2f} ms")
            print(f"Min Latency:        {min_latency:.2f} ms")
            print(f"Max Latency:        {max_latency:.2f} ms")
            print(f"P95 Latency:        {p95_latency:.2f} ms")
            print(f"{'='*50}\n")
    
    def cleanup(self):
        """Đóng connections"""
        if self.producer:
            self.producer.close()
        if self.consumer:
            self.consumer.close()
        print("✓ Cleanup completed")

def main():
    """Main test function"""
    print("\n" + "="*50)
    print("KAFKA PERFORMANCE TEST SUITE")
    print("="*50)
    print(f"Kafka Server: {KAFKA_BOOTSTRAP_SERVERS}")
    print(f"Test Topic: {TEST_TOPIC}")
    print("="*50 + "\n")
    
    tester = KafkaSpeedTest()
    
    try:
        # Test 1: Producer Throughput
        tester.setup_producer()
        producer_results = tester.test_producer_throughput(num_messages=NUM_MESSAGES)
        
        # Wait a bit
        time.sleep(2)
        
        # Test 2: Consumer Throughput
        tester.setup_consumer()
        consumer_results = tester.test_consumer_throughput(expected_messages=NUM_MESSAGES)
        
        # Test 3: End-to-End Latency
        tester.test_end_to_end_latency(num_samples=50)
        
        # Summary
        print("\n" + "="*50)
        print("TEST SUMMARY")
        print("="*50)
        print(f"Producer Throughput:    {producer_results['throughput']:.2f} msg/s")
        print(f"Producer Avg Latency:   {producer_results['avg_latency']:.2f} ms")
        print(f"Consumer Throughput:    {consumer_results['throughput']:.2f} msg/s")
        print("="*50 + "\n")
        
        # Evaluation
        if producer_results['throughput'] > 100 and consumer_results['throughput'] > 100:
            print("✓ Kafka performance: GOOD")
        elif producer_results['throughput'] > 50 and consumer_results['throughput'] > 50:
            print("⚠ Kafka performance: MODERATE - Consider optimization")
        else:
            print("✗ Kafka performance: POOR - Needs optimization!")
        
    except Exception as e:
        print(f"\n✗ Test failed: {e}")
        import traceback
        traceback.print_exc()
    finally:
        tester.cleanup()

if __name__ == '__main__':
    main()
