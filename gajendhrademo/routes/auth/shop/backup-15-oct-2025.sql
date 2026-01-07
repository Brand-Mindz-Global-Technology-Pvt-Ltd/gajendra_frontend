-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Oct 14, 2025 at 05:48 PM
-- Server version: 8.0.43-0ubuntu0.24.04.2
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `app`
--

-- --------------------------------------------------------

--
-- Table structure for table `blogs`
--

CREATE TABLE `blogs` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `content` text NOT NULL,
  `image` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `carts`
--

CREATE TABLE `carts` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int NOT NULL DEFAULT '0',
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `carts`
--

INSERT INTO `carts` (`id`, `user_id`, `session_id`, `created_at`, `updated_at`) VALUES
(17, 0, 'session_1759230770436_206y7layb', '2025-09-30 11:33:38', '2025-09-30 11:33:38'),
(18, 0, 'session_1759232732487_04qtno9j0', '2025-09-30 11:45:32', '2025-09-30 11:45:32'),
(19, 0, 'session_1759217368193_4t9g5gyoy', '2025-09-30 12:25:29', '2025-09-30 12:25:29'),
(20, 0, 'session_1759244600195_tvzqgnhdd', '2025-10-02 04:33:37', '2025-10-02 04:33:37'),
(21, 0, 'session_1759380217002_pt2hcdzzi', '2025-10-02 04:43:37', '2025-10-02 04:43:37'),
(24, 0, 'session_1759462971466_ol64d45n0', '2025-10-03 12:09:18', '2025-10-03 12:09:18'),
(31, 0, 'session_1759493923102_gqry2mk3w', '2025-10-04 05:42:58', '2025-10-04 05:42:58'),
(32, 0, 'session_1759557674453_8tk2z1lc4', '2025-10-04 06:01:14', '2025-10-04 06:01:14'),
(33, 0, 'session_1759559125695_4z48hvs55', '2025-10-04 06:25:25', '2025-10-04 06:25:25'),
(35, 0, 'session_1759559254235_3a5pzj99e', '2025-10-04 06:29:47', '2025-10-04 06:29:47'),
(36, 0, 'session_1760077498896_jxpyihaz4', '2025-10-10 06:26:37', '2025-10-10 06:26:37'),
(37, 0, 'session_1760077818839_g5zgbh1kc', '2025-10-10 06:30:19', '2025-10-10 06:30:19'),
(38, 0, 'session_1760078204897_8ma1lebq1', '2025-10-10 06:36:45', '2025-10-10 06:36:45'),
(39, 0, 'session_1760080082111_pzlifyhdo', '2025-10-10 07:08:02', '2025-10-10 07:08:02'),
(40, 0, 'session_1760462353436_l1a8e9nks', '2025-10-14 17:19:13', '2025-10-14 17:19:13');

-- --------------------------------------------------------

--
-- Table structure for table `cart_items`
--

CREATE TABLE `cart_items` (
  `id` int UNSIGNED NOT NULL,
  `cart_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `quantity` int NOT NULL DEFAULT '1',
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `cart_items`
--

INSERT INTO `cart_items` (`id`, `cart_id`, `product_id`, `quantity`, `price`, `created_at`, `updated_at`) VALUES
(31, 19, 30, 2, 599.00, '2025-09-30 12:26:16', '2025-09-30 12:32:00'),
(68, 24, 33, 1, 285.00, '2025-10-03 12:18:37', '2025-10-03 12:18:37'),
(77, 31, 30, 2, 599.00, '2025-10-04 05:47:59', '2025-10-04 05:48:19'),
(78, 32, 33, 1, 285.00, '2025-10-04 06:01:26', '2025-10-04 06:01:26'),
(79, 33, 33, 1, 285.00, '2025-10-04 06:26:14', '2025-10-04 06:26:14');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int UNSIGNED NOT NULL,
  `shop_id` int UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `image_path` varchar(255) DEFAULT NULL,
  `slug` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `shop_id`, `name`, `image_path`, `slug`, `created_at`, `updated_at`) VALUES
(9, 9, 'NutriMix', 'categories/68e0e0f04400c.avif', 'nutrimix', '2025-09-30 11:43:52', '2025-10-04 08:55:12'),
(10, 9, 'Biscuits', 'categories/68e0e2af02c6d.jpg', 'biscuits', '2025-10-02 04:52:18', '2025-10-04 09:02:39'),
(11, 9, 'Choco Crunch', 'categories/68e0e1dbde371.avif', 'choco-crunch', '2025-10-02 05:05:21', '2025-10-04 08:59:07');

-- --------------------------------------------------------

--
-- Table structure for table `email_otps`
--

CREATE TABLE `email_otps` (
  `id` int NOT NULL,
  `email` varchar(255) NOT NULL,
  `otp_code` varchar(10) NOT NULL,
  `purpose` enum('signup','forgot') DEFAULT 'signup',
  `expires_at` timestamp NOT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int NOT NULL DEFAULT '0',
  `order_number` varchar(50) NOT NULL,
  `total_amount` decimal(10,2) NOT NULL,
  `status` enum('pending','confirmed','shipped','delivered','cancelled') NOT NULL DEFAULT 'pending',
  `shipping_address` text,
  `billing_address` text,
  `payment_method` varchar(50) DEFAULT NULL,
  `payment_status` enum('pending','paid','failed','refunded') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `orders`
--

INSERT INTO `orders` (`id`, `user_id`, `order_number`, `total_amount`, `status`, `shipping_address`, `billing_address`, `payment_method`, `payment_status`, `created_at`, `updated_at`) VALUES
(8, 18, 'ORD-20251004054057-2b80f4', 599.00, 'confirmed', '46, b Seethakathi Nagar, Kayalpattinam, Tamil Nadu, India, 628204', '46, b Seethakathi Nagar, Kayalpattinam, Tamil Nadu, India, 628204', 'razorpay', 'paid', '2025-10-04 05:40:57', '2025-10-04 05:40:57'),
(9, 18, 'ORD-20251004054258-e8e7f2', 965.00, 'delivered', 'Seethakathi nagar, Kayalpattinam, Tamil Nadu, India, 628204', 'Seethakathi nagar, Kayalpattinam, Tamil Nadu, India, 628204', 'razorpay', 'paid', '2025-10-04 05:42:58', '2025-10-04 05:44:12'),
(10, 18, 'ORD-20251004062947-94df4a', 285.00, 'confirmed', '46, b Seethakathi Nagar, Tamil Nadu, Tamil Nadu, India, 628204', '46, b Seethakathi Nagar, Tamil Nadu, Tamil Nadu, India, 628204', 'razorpay', 'paid', '2025-10-04 06:29:47', '2025-10-04 06:29:47');

-- --------------------------------------------------------

--
-- Table structure for table `order_items`
--

CREATE TABLE `order_items` (
  `id` int UNSIGNED NOT NULL,
  `order_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `created_at`) VALUES
(10, 8, 30, 1, 599.00, '2025-10-04 05:40:57'),
(11, 9, 31, 1, 466.00, '2025-10-04 05:42:58'),
(12, 9, 34, 1, 499.00, '2025-10-04 05:42:58'),
(13, 10, 33, 1, 285.00, '2025-10-04 06:29:47');

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int UNSIGNED NOT NULL,
  `shop_id` int UNSIGNED NOT NULL,
  `category_id` int UNSIGNED NOT NULL,
  `name` varchar(255) NOT NULL,
  `slug` varchar(255) NOT NULL,
  `description` text,
  `price` decimal(10,2) NOT NULL DEFAULT '0.00',
  `stock` int NOT NULL DEFAULT '0',
  `is_new_arrival` tinyint(1) NOT NULL DEFAULT '0',
  `status` enum('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `best_sale` tinyint(1) NOT NULL DEFAULT '0',
  `onsale` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `shop_id`, `category_id`, `name`, `slug`, `description`, `price`, `stock`, `is_new_arrival`, `status`, `created_at`, `updated_at`, `best_sale`, `onsale`) VALUES
(30, 9, 9, 'Nutrimix Chocolate Nutrition Powder (350g)', 'nutrimix-chocolate-nutrition-powder', '🌾6g of protein per serving of Nutrimix, essential for kids aged 2-6 for healthy growth & development.\r\n\r\n🥛 Can be had as morning milk or a yummy afternoon milkshake!\r\n\r\n⬆️ Height growth with plant-based protein sources like moong dal, peas & brown rice.\r\n\r\n🛡️Boosts immunity with superfoods like ragi & bajra and 23 vitamins & minerals.\r\n\r\n💪🏼 Ensures healthy weight gain with the goodness of almonds and walnuts.\r\n\r\n🦴 Calcium to help build strong bones and DHA (Omega3) for brain development.\r\n\r\n🚫 No refined sugar or maltodextrin. Naturally sweetened with dates and jaggery.', 599.00, 20, 1, 'active', '2025-09-30 11:45:20', '2025-10-02 08:13:32', 1, 0),
(31, 9, 9, 'AptaGrow Nutrition Milk Drink Powder Vanilla Flavour - 400 gm', 'aptagrow-nutrition-milk-drink', 'It is very healthy and tasty milk drink for your children. They love to drink it very happily because its taste is too yummy and its ingredients blend together to give a rich flavour. This health drink has a good amount of vitamins that help your child growth. It is  a best health drink.', 466.00, 10, 0, 'active', '2025-10-02 04:42:15', '2025-10-02 04:42:15', 0, 0),
(32, 9, 10, 'Slurrp Farm Np Maida No Refined Sugar Banana Oat and Choco Ragi Cookies', 'slurrp-farm-no-maida', 'Contains No Maida, No Refined Sugar, No Palm Oil, No Artificial Colours, No Preservatives\r\nFilled with the goodness of whole wheat flour, jowar, oats, natural banana powder and ragi\r\nRagi is rich in calcium, while jowar is a good source of protein and High in fibre\r\nPerfect for tiffins, travel or snack time!\r\nMade by two mothers for everyone in the family.', 259.00, 10, 1, 'active', '2025-10-02 04:56:50', '2025-10-02 08:13:40', 0, 1),
(33, 9, 11, 'Little Joys Millet Choco Crunch | Healthy Breakfast Cereal for Kids', 'kittle-joys-millet-choco-crunch', 'Wholesome Breakfast for Kids – Little Joys Millet Choco Crunch is a tasty and healthy breakfast option made with a blend of ragi, jowar, red rice, and foxtail millet.\r\nDelicious Choco Crunch – Crispy chocolate-flavored bites that kids love, perfect to kickstart the day with energy.\r\nNo Maida, No Refined Sugar – Sweetened naturally with jaggery for guilt-free indulgence without artificial sweeteners.\r\nPacked with Nutrition – Rich in protein and fiber to support growing bodies and active lifestyles.\r\nNo Preservatives or Additives – Clean label ingredients with no artificial flavors, colors, or preservatives.', 285.00, 10, 1, 'active', '2025-10-02 05:08:14', '2025-10-02 05:08:14', 0, 0),
(34, 9, 9, 'DHA Omega3 Brain Gummies 2+ (30N)', 'dha-omega3', '► For Ages 2+\r\n\r\n► Our DHA Brain Gummies boost memory, concentration and long term brain development!\r\n\r\n► Powered by DHA & Choline + with 8 nutrients and 4 delicious fruits and veggies.\r\n\r\n► Bonus? It has zero added sugar!\r\n\r\n30 Gummies | 100% Safe | Pediatrician Recommended', 499.00, 20, 0, 'active', '2025-10-02 08:10:51', '2025-10-02 08:10:51', 0, 0);

-- --------------------------------------------------------

--
-- Table structure for table `product_images`
--

CREATE TABLE `product_images` (
  `id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `is_spotlight` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `product_images`
--

INSERT INTO `product_images` (`id`, `product_id`, `image_path`, `created_at`, `is_spotlight`) VALUES
(30, 30, '1759232720_Nutrimix-2+-No-refined-Sugar_a0tklj.avif', '2025-09-30 11:45:20', 1),
(31, 30, '1759232720_Nutrimix hero image (1)_b71n36.avif', '2025-09-30 11:45:20', 1),
(32, 30, '1759232720_Slide-2-2_66kh4t.avif', '2025-09-30 11:45:20', 0),
(33, 30, '1759232720_what is it good for- (1)_dgyz0q.avif', '2025-09-30 11:45:20', 0),
(34, 31, '1759380135_11423438a.webp', '2025-10-02 04:42:15', 0),
(35, 31, '1759380135_11423438b.webp', '2025-10-02 04:42:15', 0),
(36, 31, '1759380135_11423438e.webp', '2025-10-02 04:42:15', 0),
(37, 31, '1759380135_11423438g.webp', '2025-10-02 04:42:15', 0),
(38, 32, '1759381010_71apuQjYa2L._SL1500_.jpg', '2025-10-02 04:56:50', 0),
(39, 32, '1759381010_71pUoOL0C-L._SL1500_.jpg', '2025-10-02 04:56:50', 0),
(40, 32, '1759381010_717OntIgBqL._SL1500_.jpg', '2025-10-02 04:56:50', 0),
(41, 32, '1759381010_818H3ljOHSL._SL1500_.jpg', '2025-10-02 04:56:50', 0),
(42, 33, '1759381694_71Fw4-kMM3L._SX679_.jpg', '2025-10-02 05:08:14', 0),
(43, 33, '1759381694_81QZ+9gu6GL._SX679_.jpg', '2025-10-02 05:08:14', 0),
(44, 33, '1759381694_714mbYOnvCL._SL1500_.jpg', '2025-10-02 05:08:14', 0),
(45, 34, '1759392651_1&2 hero img (1)_cmfmsy.avif', '2025-10-02 08:10:51', 1),
(46, 34, '1759392651_GST Festive_8u9xm7.avif', '2025-10-02 08:10:51', 0),
(47, 34, '1759392651_IBK_grxmdn.avif', '2025-10-02 08:10:51', 0),
(48, 34, '1759392651_IBK_grxmdn (1).avif', '2025-10-02 08:10:51', 0);

-- --------------------------------------------------------

--
-- Table structure for table `reviews`
--

CREATE TABLE `reviews` (
  `id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `user_id` int NOT NULL,
  `rating` tinyint UNSIGNED NOT NULL,
  `review_text` text,
  `photo` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `reviews`
--

INSERT INTO `reviews` (`id`, `product_id`, `user_id`, `rating`, `review_text`, `photo`, `created_at`) VALUES
(6, 32, 18, 4, 'Keep your home organized, yet elegant with storage cabinets by Onita Patio Furniture. These cabinets not only make a great storage units, but also bring a great decorative accent to your decor. \r\n\r\nTraditionally designed, they are perfect to be used in the hallway, living room, bedroom,\r\n                    office or any place where you need to store or display\r\n                    things. Made of high quality materials, they are sturdy and\r\n                    durable for years. Bring one-of-a-kind look to your interior\r\n                    with furniture from Onita Furniture!', 'review/68e8c6b06f1c2.jpg', '2025-10-10 08:41:20'),
(7, 32, 18, 3, 'Keep your home organized, yet elegant with storage cabinets\r\n                    by Onita Patio Furniture. These cabinets not only make a\r\n                    great storage units, but also bring a great decorative\r\n                    accent to your decor. Traditionally designed, they are\r\n                    perfect to be used in the hallway, living room, bedroom,\r\n                    office or any place where you need to store or display\r\n                    things. Made of high quality materials, they are sturdy and\r\n                    durable for years. Bring one-of-a-kind look to your interior\r\n                    with furniture from Onita Furniture!', 'review/68e8c79063974.jpg', '2025-10-10 08:45:04'),
(8, 32, 18, 5, 'Keep your home organized, yet elegant with storage cabinets\r\n                    by Onita Patio Furniture. These cabinets not only make a\r\n                    great storage units, but also bring a great decorative\r\n                    accent to your decor. Traditionally designed, they are\r\n                    perfect to be used in the hallway, living room, bedroom,\r\n                    office or any place where you need to store or display\r\n                    things. Made of high quality materials, they are sturdy and\r\n                    durable for years. Bring one-of-a-kind look to your interior\r\n                    with furniture from Onita Furniture!', 'review/68e8c9ba330d6.png', '2025-10-10 08:54:18'),
(9, 32, 18, 3, 'Keep your home organized, yet elegant with storage cabinets\r\n                    by Onita Patio Furniture. These cabinets not only make a\r\n                    great storage units, but also bring a great decorative\r\n                    accent to your decor. Traditionally designed, they are\r\n                    perfect to be used in the hallway, living room, bedroom,\r\n                    office or any place where you need to store or display\r\n                    things. Made of high quality materials, they are sturdy and\r\n                    durable for years. Bring one-of-a-kind look to your interior\r\n                    with furniture from Onita Furniture!', 'review/68e8ca275c13c.jpg', '2025-10-10 08:56:07'),
(10, 32, 18, 1, 'Keep your home organized, yet elegant with storage cabinets\r\n                    by Onita Patio Furniture. These cabinets not only make a\r\n                    great storage units, but also bring a great decorative\r\n                    accent to your decor. Traditionally designed, they are\r\n                    perfect to be used in the hallway, living room, bedroom,\r\n                    office or any place where you need to store or display\r\n                    things. Made of high quality materials, they are sturdy and\r\n                    durable for years. Bring one-of-a-kind look to your interior\r\n                    with furniture from Onita Furniture!', 'review/68e8cb6f57dfd.jpg', '2025-10-10 09:01:35');

-- --------------------------------------------------------

--
-- Table structure for table `review_images`
--

CREATE TABLE `review_images` (
  `id` int UNSIGNED NOT NULL,
  `review_id` int UNSIGNED NOT NULL,
  `image_path` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `review_images`
--

INSERT INTO `review_images` (`id`, `review_id`, `image_path`, `created_at`) VALUES
(1, 8, 'review/68e8c9ba330d6.png', '2025-10-10 08:54:18'),
(2, 8, 'review/68e8c9ba33473.jpg', '2025-10-10 08:54:18'),
(3, 8, 'review/68e8c9ba338a6.webp', '2025-10-10 08:54:18'),
(4, 9, 'review/68e8ca275c13c.jpg', '2025-10-10 08:56:07'),
(5, 10, 'review/68e8cb6f57dfd.jpg', '2025-10-10 09:01:35'),
(6, 10, 'review/68e8cb6f58195.webp', '2025-10-10 09:01:35'),
(7, 10, 'review/68e8cb6f583ff.jpg', '2025-10-10 09:01:35');

-- --------------------------------------------------------

--
-- Table structure for table `shops`
--

CREATE TABLE `shops` (
  `id` int NOT NULL,
  `name` varchar(150) NOT NULL,
  `description` text,
  `user_id` int NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `shops`
--

INSERT INTO `shops` (`id`, `name`, `description`, `user_id`, `created_at`, `updated_at`) VALUES
(9, 'Indian_Tribe', 'New shop created', 17, '2025-09-30 11:43:08', '2025-09-30 11:43:08'),
(10, 'admin', 'New shop created', 17, '2025-09-30 11:43:08', '2025-10-14 17:43:39');

-- --------------------------------------------------------

--
-- Table structure for table `spotlights`
--

CREATE TABLE `spotlights` (
  `id` int NOT NULL,
  `title` varchar(255) NOT NULL,
  `spotlight_short_description` text NOT NULL,
  `learn_more_url` varchar(500) DEFAULT NULL,
  `image_path` varchar(255) NOT NULL,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `display_order` int NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `spotlights`
--

INSERT INTO `spotlights` (`id`, `title`, `spotlight_short_description`, `learn_more_url`, `image_path`, `is_active`, `display_order`, `created_at`, `updated_at`) VALUES
(1, 'Test Spotlight', 'Test Description', 'https://example.com', '1760463559_68ee8ac73696c.jpg', 1, 1, '2025-10-14 17:39:19', '2025-10-14 17:40:07'),
(2, 'hhjbjdsjfb', 'bcbjdsbcj', 'https://jsjjnsdjd.com/dsjhdjbshd', '1760463901_68ee8c1dceea3.jpeg', 1, 1, '2025-10-14 17:45:01', '2025-10-14 17:45:01'),
(3, 'mjncjkdscvjk', 'ndsvncdfjvk', 'https://jsjjnsdjd.com/dsjhdjbsc', '1760463946_68ee8c4a4f4a7.jpeg', 1, 1, '2025-10-14 17:45:46', '2025-10-14 17:45:46');

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(15) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL DEFAULT 'user',
  `is_verified` tinyint(1) DEFAULT '0',
  `agreed_terms` tinyint(1) DEFAULT '0',
  `status` varchar(50) DEFAULT 'active',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `phone`, `password_hash`, `role`, `is_verified`, `agreed_terms`, `status`, `created_at`, `updated_at`) VALUES
(17, 'Admin', 'admin@brandmindz.com', '9876543210', '$2y$10$XteAR3eL3nCwentEopw3D.6TtktZtgvxIl5PYp7osC50UkgUrVZZ6', 'admin', 1, 1, 'active', '2025-09-30 11:43:08', '2025-09-30 11:43:08'),
(18, 'Mohamed Saadh', 'developer.saadh@gmail.com', '9499025015', '$2y$10$HtVwLAWzG.LAgnRA6pSli.3wUaBg6kun8XRsvq6kecS/oKXS8Mhze', 'user', 1, 1, 'active', '2025-09-30 12:21:21', '2025-09-30 12:21:21'),
(19, 'admin', 'admin@admin.com', '7894561230', '$2y$10$TucEfzE5n4LOHsvu/L78WOEr4zdnbRfIw7.8x4XNO.SSqlgEzpK36', 'admin', 1, 1, 'active', '2025-10-14 17:20:47', '2025-10-14 17:20:47');

-- --------------------------------------------------------

--
-- Table structure for table `user_sessions`
--

CREATE TABLE `user_sessions` (
  `id` int NOT NULL,
  `user_id` int NOT NULL,
  `session_token` varchar(255) NOT NULL,
  `expires_at` timestamp NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wishlists`
--

CREATE TABLE `wishlists` (
  `id` int UNSIGNED NOT NULL,
  `user_id` int NOT NULL DEFAULT '0',
  `session_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `wishlists`
--

INSERT INTO `wishlists` (`id`, `user_id`, `session_id`, `created_at`, `updated_at`) VALUES
(1, 0, 'session_1759396776893_ngln8jc2o', '2025-10-02 10:19:14', '2025-10-02 10:19:14'),
(2, 0, 'session_1759462971626_fjw1klw75', '2025-10-03 03:42:51', '2025-10-03 03:42:51'),
(3, 0, 'session_1759493923126_k8c4xvdzh', '2025-10-03 12:18:43', '2025-10-03 12:18:43'),
(4, 0, 'session_1759557674667_bza09lflb', '2025-10-04 06:01:14', '2025-10-04 06:01:14'),
(5, 0, 'session_1759559126252_kuteyocsd', '2025-10-04 06:25:26', '2025-10-04 06:25:26'),
(6, 0, 'session_1759559254275_ial70suix', '2025-10-04 06:27:34', '2025-10-04 06:27:34'),
(7, 0, 'session_1760077499316_03mfl65o9', '2025-10-10 06:26:37', '2025-10-10 06:26:37'),
(8, 0, 'session_1760077819621_wzmlvu14t', '2025-10-10 06:30:19', '2025-10-10 06:30:19'),
(9, 0, 'session_1760078205214_vjnb2lo0l', '2025-10-10 06:36:45', '2025-10-10 06:36:45'),
(10, 0, 'session_1760080082844_fmti59wha', '2025-10-10 07:08:02', '2025-10-10 07:08:02');

-- --------------------------------------------------------

--
-- Table structure for table `wishlist_items`
--

CREATE TABLE `wishlist_items` (
  `id` int UNSIGNED NOT NULL,
  `wishlist_id` int UNSIGNED NOT NULL,
  `product_id` int UNSIGNED NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `blogs`
--
ALTER TABLE `blogs`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `slug` (`slug`);

--
-- Indexes for table `carts`
--
ALTER TABLE `carts`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `idx_user_session` (`user_id`,`session_id`);

--
-- Indexes for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_cart_product` (`cart_id`,`product_id`),
  ADD KEY `cart_id` (`cart_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shop_id` (`shop_id`);

--
-- Indexes for table `email_otps`
--
ALTER TABLE `email_otps`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_email_purpose` (`email`,`purpose`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_number` (`order_number`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_created_at` (`created_at`),
  ADD KEY `idx_user_status` (`user_id`,`status`);

--
-- Indexes for table `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `order_id` (`order_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `shop_id` (`shop_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `slug` (`slug`);

--
-- Indexes for table `product_images`
--
ALTER TABLE `product_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indexes for table `reviews`
--
ALTER TABLE `reviews`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_product_id` (`product_id`),
  ADD KEY `idx_user_id` (`user_id`);

--
-- Indexes for table `review_images`
--
ALTER TABLE `review_images`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_review_id` (`review_id`);

--
-- Indexes for table `shops`
--
ALTER TABLE `shops`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_shops_user` (`user_id`);

--
-- Indexes for table `spotlights`
--
ALTER TABLE `spotlights`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_active_order` (`is_active`,`display_order`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `session_token` (`session_token`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `idx_session_token` (`session_token`),
  ADD KEY `idx_expires_at` (`expires_at`);

--
-- Indexes for table `wishlists`
--
ALTER TABLE `wishlists`
  ADD PRIMARY KEY (`id`),
  ADD KEY `user_id` (`user_id`),
  ADD KEY `session_id` (`session_id`),
  ADD KEY `idx_user_session` (`user_id`,`session_id`);

--
-- Indexes for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_wishlist_product` (`wishlist_id`,`product_id`),
  ADD KEY `wishlist_id` (`wishlist_id`),
  ADD KEY `product_id` (`product_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `blogs`
--
ALTER TABLE `blogs`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `carts`
--
ALTER TABLE `carts`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=41;

--
-- AUTO_INCREMENT for table `cart_items`
--
ALTER TABLE `cart_items`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=82;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `email_otps`
--
ALTER TABLE `email_otps`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=30;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT for table `product_images`
--
ALTER TABLE `product_images`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;

--
-- AUTO_INCREMENT for table `reviews`
--
ALTER TABLE `reviews`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `review_images`
--
ALTER TABLE `review_images`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `shops`
--
ALTER TABLE `shops`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `spotlights`
--
ALTER TABLE `spotlights`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT for table `user_sessions`
--
ALTER TABLE `user_sessions`
  MODIFY `id` int NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wishlists`
--
ALTER TABLE `wishlists`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `cart_items`
--
ALTER TABLE `cart_items`
  ADD CONSTRAINT `cart_items_ibfk_1` FOREIGN KEY (`cart_id`) REFERENCES `carts` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `cart_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `order_items`
--
ALTER TABLE `order_items`
  ADD CONSTRAINT `order_items_ibfk_1` FOREIGN KEY (`order_id`) REFERENCES `orders` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `order_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `product_images`
--
ALTER TABLE `product_images`
  ADD CONSTRAINT `product_images_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `reviews`
--
ALTER TABLE `reviews`
  ADD CONSTRAINT `fk_reviews_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_reviews_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `review_images`
--
ALTER TABLE `review_images`
  ADD CONSTRAINT `fk_review_images_review` FOREIGN KEY (`review_id`) REFERENCES `reviews` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `shops`
--
ALTER TABLE `shops`
  ADD CONSTRAINT `fk_shops_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `user_sessions`
--
ALTER TABLE `user_sessions`
  ADD CONSTRAINT `user_sessions_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `wishlist_items`
--
ALTER TABLE `wishlist_items`
  ADD CONSTRAINT `wishlist_items_ibfk_1` FOREIGN KEY (`wishlist_id`) REFERENCES `wishlists` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `wishlist_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
